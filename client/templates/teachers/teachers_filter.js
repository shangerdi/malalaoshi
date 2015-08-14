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
  gradeOptionList.push({key:"all",text:"-全部-"});
  _.each(gradeDict, function(obj){
    gradeOptionList.push({key:obj.key, text:obj.text});
  });

  this.data.eduGradeList = gradeOptionList;

  if(this.data.setAddress != "setAddress"){
    Session.set("locationLngLat", null);
    Session.set("locationAddress", null);
    Session.set("locationStreet", null);
  }
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
    var sub = Session.get('teachersSubjectIndex');
    sub = sub == 0 ? true : sub;
    var grade = Session.get('teachersGradeIndex');
    grade = grade == 0 ? true : grade;
    var way  = Session.get('teachersTeacherWay');
    var studyAddress = self.data.setAddress == "setAddress" ? Session.get("locationAddress") : false;

    $('.buttom-btn-view').removeClass("buttom-btn-view-active");
    $('.buttom-btn-view').addClass("buttom-btn-view-no-active");
    if(sub && grade && (way == "goHome" || way == "studyCenter") && studyAddress){
      $('.buttom-btn-view').removeClass("buttom-btn-view-no-active");
      $('.buttom-btn-view').addClass("buttom-btn-view-active");
    }else{
      $('.buttom-btn-view').removeClass("buttom-btn-view-active");
      $('.buttom-btn-view').addClass("buttom-btn-view-no-active");
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
    swiper.container.find("div>div").removeClass("swiper-slide-in");
    if(select != null){
      swiper.container.find("div>div:eq("+select+")").addClass("swiper-slide-in");
    }
  });
  self.data.swiperGrade.on("setTranslate", function(swiper, translate){
    var select = getSwiperSlideInWindow(swiper, translate);
    Session.set('teachersGradeIndex', select);
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
  canSearch: function(){
    var sub = Session.get('teachersSubjectIndex');
    sub = sub == 0 ? true : sub;
    var grade = Session.get('teachersGradeIndex');
    grade = grade == 0 ? true : grade;
    var way  = Session.get('teachersTeacherWay');

    return sub && grade && way && this.studyAddress;
  },
  searchBtnClass: function(){
    var sub = Session.get('teachersSubjectIndex');
    sub = sub == 0 ? true : sub;
    var grade = Session.get('teachersGradeIndex');
    grade = grade == 0 ? true : grade;
    var way  = Session.get('teachersTeacherWay');
    var studyAddress = this.setAddress == "setAddress" ? Session.get("locationAddress") : false;

    var canSearch = sub && grade && way && studyAddress;
    //return canSearch ? "buttom-btn-view-active" : "buttom-btn-view-no-active";
    return "xx";
  }
});

function subjectGradeSelectVisible(sgSelectParent, disPlay){
  if(disPlay == 'block'){
    sgSelectParent.css('display', 'block');

    $('#subjectGradeTitle').parent().css('width', '100%');
  }else if(disPlay == 'none'){
    sgSelectParent.css('display', 'none');

    $('#subjectGradeTitle').parent().css('width', '95%');
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
    Router.go("map");
  },
  'click #btnSaveAndPay': function(e){
    $('#btnSaveAndPay').parent().removeClass('buttom-btn-view-no-active');
    $('#btnSaveAndPay').parent().addClass('buttom-btn-view-active');
  },
  'click #teacherWayStudyCenter': function(e){
    Session.set('teachersTeacherWay', null);
    var studyAddress = this.setAddress == "setAddress" ? Session.get("locationAddress") : false;
    if(!studyAddress){
      popupInfo("请先选择上课地点！");
      return false;
    }
    var localPoint = Session.get("locationLngLat");
    IonLoading.show({backdrop:true});
    Meteor.call('getStudyCentersByPlace', Session.get("locationDefaultCity"), localPoint.lng, localPoint.lat, function(error, result){
      IonLoading.hide();
      if(error){
        return throwError(error.reason);
      }

      console.log("...............返回........")
      console.log(result);
    });

    Session.set('teachersTeacherWay', "studyCenter");
  },
  'click #teacherWayGoHome': function(e){
    Session.set('teachersTeacherWay', "goHome");
  }
});
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
Template.selectTeachSubject.helpers({
  subject: function(){
  }
});
