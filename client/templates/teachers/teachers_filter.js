var subjectOptionList = [], gradeOptionList=[];
function getSwiperSlideInWindow(swiper, translate){
  var all = swiper.snapGrid;
  if(all.length === 0){
    return null;
  }
  var preDist = Infinity, cuttentDist = null, nextDist = null, notGetCurent = true, checkDist = 0;
  if(all.length >= 2){
    checkDist = all[0] - all[1];
    checkDist = checkDist < 0 ? (checkDist * -1 - 16) : (checkDist - 16);
  }
  var refDist = checkDist <= 44 ? 44 : checkDist - 44;
  for(var i=0; i<all.length-1; i++){
    cuttentDist = all[i] + translate;
    cuttentDist = cuttentDist < 0 ? cuttentDist * -1 : cuttentDist;

    nextDist = all[i+1] + translate;
    nextDist = nextDist < 0 ? nextDist * -1 : nextDist;

    if(preDist < cuttentDist){
      return preDist <= refDist ? (i-1) : null;
    }else if(cuttentDist < nextDist){
      return cuttentDist <= refDist ? i : null;
    }
    preDist = cuttentDist;
  }
  return nextDist <= refDist ? i : null;
}
function checkCondition(setAddress){
  var sub = Session.get('teachersSubjectIndex');
  sub = sub == 0 ? true : sub;
  var grade = Session.get('teachersGradeIndex');
  grade = grade == 0 ? true : grade;
  var way  = Session.get('teachersTeacherWay');
  var studyAddress = setAddress == "setAddress" ? Session.get("locationAddress") : false;
  var studyCenters = Session.get('selectedStudyCenters');
  var selectedStudyCenter = studyCenters && studyCenters.length > 0 ? true : false;

  return sub && grade && (way == "goHome" || (way == "studyCenter" && selectedStudyCenter)) && studyAddress;
}
Template.teachersFilter.onCreated(function(){
  appSetDefaultCity();
  var subjectDict = getEduSubjectDict();
  subjectOptionList = [];
  subjectOptionList.push({key:"all",text:"-全部-"});
  _.each(subjectDict, function(obj){
    subjectOptionList.push({key:obj.key, text:obj.text});
  });

  this.data.eduSubjectList = subjectOptionList;
  var gradeDict = getEduGradeDict();
  gradeOptionList = [];
  gradeOptionList.push({key:"all_elementary",text:"小学"});
  gradeOptionList.push({key:"all_middle",text:"初中"});
  gradeOptionList.push({key:"all_high",text:"高中"});
  _.each(gradeDict, function(obj){
    gradeOptionList.push({key:obj.key, text:obj.text});
  });

  this.data.eduGradeList = gradeOptionList;

  if(this.data.setAddress != "setAddress"){
    Session.set("locationLngLat", null);
    Session.set("locationAddress", null);
    Session.set("locationStreet", null);
  }

  this.studyCenters = new ReactiveVar([]);
});
Template.teachersFilter.onRendered(function(){
  var self = this;
  self.autorun(function(){
    var way = Session.get('teachersTeacherWay');
    $('#teacherWayStudyCenter').css("color","#988c8d");
    $('#teacherWayGoHome').css("color","#988c8d");

    if(way == "goHome"){
      $('#teacherWayGoHome').css("color","#000000");
    }else if(way == "studyCenter"){
      $('#teacherWayStudyCenter').css("color","#000000");
    }
  });
  self.autorun(function(){
    $('.bottom-btn-view button').addClass("disabled");

    if(checkCondition(self.data.setAddress)){
      $('.bottom-btn-view button').removeClass("disabled");
    }
  });
});
Template.selectTeachSubjectTeachersFilter.onRendered(function(){
  var self = this;
  self.data.swiperSubject = new Swiper('.swiper-subject', {
    slidesPerView: 5,
    centeredSlides: true,
    spaceBetween: 2,
    paginationClickable: false,
    freeMode: true,
    freeModeMomentum: true,
    freeModeMomentumRatio: 0.5,
    freeModeMomentumBounceRatio: 0.01,
    freeModeMomentumBounce: true,
    freeModeSticky: true,
    direction: 'vertical'
  });
  self.data.swiperGrade = new Swiper('.swiper-grade', {
    slidesPerView: 5,
    centeredSlides: true,
    spaceBetween: 2,
    paginationClickable: false,
    freeMode: true,
    freeModeMomentum: true,
    freeModeMomentumRatio: 0.5,
    freeModeMomentumBounceRatio: 0.01,
    freeModeMomentumBounce: true,
    freeModeSticky: true,
    direction: 'vertical',
    watchSlidesVisibility: true,
    centeredSlides: true
  });
  self.data.swiperSubject.on("setTranslate", function(swiper, translate){
    var select = getSwiperSlideInWindow(swiper, translate);
    Session.set('teachersSubjectIndex', select);
    Session.set('teachersSubject', subjectOptionList[select].key);
    swiper.container.find("div>div").removeClass("swiper-slide-in");
    if(select != null){
      swiper.container.find("div>div:eq("+select+")").addClass("swiper-slide-in");
    }
  });
  self.data.swiperGrade.on("setTranslate", function(swiper, translate){
    var select = getSwiperSlideInWindow(swiper, translate);
    Session.set('teachersGradeIndex', select);
    Session.set('teachersGrade', gradeOptionList[select].key);
    swiper.container.find("div>div").removeClass("swiper-slide-in");
    if(select != null){
      swiper.container.find("div>div:eq("+select+")").addClass("swiper-slide-in");
    }
  });
  var subjectInd = Session.get('teachersSubjectIndex');
  if(!subjectInd){
    subjectInd = 0;
  }
  self.data.swiperSubject.slideTo(subjectInd, 0, null);
  self.data.swiperSubject.container.find("div>div:eq("+subjectInd+")").addClass("swiper-slide-in");

  var gradeInd = Session.get('teachersGradeIndex');
  if(!gradeInd){
    gradeInd = 0;
  }
  self.data.swiperGrade.slideTo(gradeInd, 0, null);
  self.data.swiperGrade.container.find("div>div:eq("+gradeInd+")").addClass("swiper-slide-in");
});
Template.teachersFilter.onCreated(function () {
  IonNavigation.skipTransitions = true;
  Session.set("selectTeachSubjectTeachersFilter", null);
});
Template.teachersFilter.helpers({
  selectTeachSubjectTeachersFilter: function(){
    return Session.get("selectTeachSubjectTeachersFilter");
  },
  teachersSubject: function(){
    var ind = Session.get('teachersSubjectIndex');
    if(!ind && ind != 0){
      return "科目";
    }else{
      return subjectOptionList[ind].text;
    }
  },
  teachersGrade: function(){
    var ind = Session.get('teachersGradeIndex');
    if(!ind && ind != 0){
      return "年级";
    }else{
      return gradeOptionList[ind].text;
    }
  },
  studyAddress: function(){
    return this.setAddress == "setAddress" ? Session.get("locationAddress") : false;
  },
  studyCentersCount: function(){
    var stCenter = Template.instance().studyCenters.get();
    return stCenter ? stCenter.length : 0;
  },
  commendStudyCenter: function(){
    var stCenter = Template.instance().studyCenters.get();
    return stCenter ? stCenter[0] : {};
  },
  otherStudyCenter: function(){
    var stCenter = Template.instance().studyCenters.get();
    return stCenter ? stCenter.slice(1) : [];
  }
});

function subjectGradeSelectVisible(sgSelectParent, disPlay){
  if(disPlay == 'block'){
    sgSelectParent.css('display', 'block');

    //$('#subjectGradeTitle').parent().css('width', '100%');
  }else if(disPlay == 'none'){
    sgSelectParent.css('display', 'none');

    //$('#subjectGradeTitle').parent().css('width', '95%');
  }
}

Template.teachersFilter.events({
  'click #subjectGradeTitle': function(e){
    e.preventDefault();
    if(!Session.get("selectTeachSubjectTeachersFilter")){
      $('.selectTeachSubjectTeachersFilter').css('display','block');
      Session.set("selectTeachSubjectTeachersFilter", "selectTeachSubjectTeachersFilter");
    }else{
      var sgSelectParent = $('#subjectGradeSelect').parent();
      subjectGradeSelectVisible(sgSelectParent, sgSelectParent.css('display') == 'block' ? 'none' : 'block');
    }
  },
  'click #studyPlace': function(e){
    e.preventDefault();
    Router.go("map");
  },
  'click #btnSearchTeachers': function(e){
    e.preventDefault();
    if(checkCondition(this.setAddress)){
      Router.go("teachers");
    }
  },
  'click #teacherWayStudyCenter': function(e, template){
    e.preventDefault();
    $("#teachersFilterNearestStudyCenter").css("display", "block");
    Session.set('teachersTeacherWay', null);
    var studyAddress = this.setAddress == "setAddress" ? Session.get("locationAddress") : false;
    if(!studyAddress){
      popupInfo("请先选择上课地点！");
      return false;
    }
    var localPoint = Session.get("locationLngLat");
    IonLoading.show({backdrop:true});

    var self = this;
    Meteor.call('getStudyCentersByPlace', Session.get("locationDefaultCity"), localPoint.lng, localPoint.lat, function(error, result){
      IonLoading.hide();
      if(error){
        return throwError(error.reason);
      }

      template.studyCenters.set(result);
    });

    Session.set('teachersTeacherWay', "studyCenter");
  },
  'click #teacherWayGoHome': function(e){
    e.preventDefault();
    $("#teachersFilterNearestStudyCenter").css("display", "none");
    Session.set('teachersTeacherWay', "goHome");
  }
});
Template.teachersFilterStudyCenter.events({
  'click .teachers-filter-study-center-item': function(e){
    e.preventDefault();
    if(!chekStudyCenterInTeachersFilter(Template.instance())){
      return false;
    }
    var classList = e.currentTarget.classList;
    var self = this;
    _.each(classList, function(obj){
      if(obj == "study-center-item-no-select"){
        Session.set('selectedStudyCenters', addSelectStudyCenter(Session.get('selectedStudyCenters'), self.studyCenter._id));
      }else if(obj == "study-center-item-select"){
        Session.set('selectedStudyCenters', removeSelectStudyCenter(Session.get('selectedStudyCenters'), self.studyCenter._id));
      }
    });
  }
});
Template.teachersFilterStudyCenter.helpers({
  formatDist: function(val){
    return accounting.formatNumber(val, 0);
  },
  itemSelect: function(){
    var self = this;
    var selected = Session.get('selectedStudyCenters');
    if(!selected){
      return "study-center-item-no-select";
    }
    var noSelect = true;
    _.each(selected, function(obj){
      if(obj && noSelect && obj == self.studyCenter._id){
        noSelect = false;
      }
    });
    return noSelect ? "study-center-item-no-select" : "study-center-item-select";
  }
});
function addSelectStudyCenter(selected, id){
  selected = selected || [];
  var noHas = true;
  _.each(selected, function(obj){
    if(noHas && obj == id){
      noHas = false;
    }
  });
  if(noHas){
    selected[selected.length] = id;
  }
  return selected;
}
function removeSelectStudyCenter(selected, id){
  selected = selected || [];
  var noHas = true;
  _.each(selected, function(obj,ind){
    if(noHas && obj == id){
      selected.splice(ind,1);
      noHas = false;
    }
  });
  return selected;
}
function popupInfo(popInfo){
  IonPopup.show({
    title: '提示',
    template: popInfo,
    buttons: [{
      text: '关闭',
      type: 'button-assertive',
      onTap: function() {
        IonPopup.close();
      }
    }]
  });
}
function chekStudyCenterInTeachersFilter(template){
  var cur = template.view;
  var noHas = true;
  while(noHas && cur.parentView){
    if(cur.parentView.name == "Template.teachersFilter"){
      noHas = false;
      break;
    }
    cur = cur.parentView;
  }
  return !noHas;
}
