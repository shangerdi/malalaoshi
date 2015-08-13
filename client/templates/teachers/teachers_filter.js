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

  if(this.data.setAddRess != "setAddRess"){
    Session.set("locationLngLat", null);
    Session.set("locationAddress", null);
    Session.set("locationStreet", null);
  }
});
Template.selectTeachSubjectTeachersFilter.onRendered(function(){
  this.data.swiperSubject = new Swiper('.swiper-subject', {
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
  this.data.swiperGrade = new Swiper('.swiper-grade', {
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
  this.data.swiperSubject.on("setTranslate", function(swiper, translate){
    var select = getSwiperSlideInWindow(swiper, translate);
    Session.set('teachersSubjectIndex', select);
    swiper.container.find("div>div").removeClass("swiper-slide-in");
    if(select != null){
      swiper.container.find("div>div:eq("+select+")").addClass("swiper-slide-in");
    }
  });
  this.data.swiperGrade.on("setTranslate", function(swiper, translate){
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
  this.data.swiperSubject.slideTo(subjectInd, 0, null);
  this.data.swiperSubject.container.find("div>div:eq("+subjectInd+")").addClass("swiper-slide-in");

  var gradeInd = Session.get('teachersGradeIndex');
  if(!gradeInd){
    gradeInd = 0;
  }
  this.data.swiperGrade.slideTo(gradeInd, 0, null);
  this.data.swiperGrade.container.find("div>div:eq("+gradeInd+")").addClass("swiper-slide-in");
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
    if(!ind || ind == 0){
      return "科目";
    }else{
      return subjectOptionList[ind].text;
    }
  },
  teachersGrade: function(){
    var ind = Session.get('teachersGradeIndex');
    if(!ind || ind == 0){
      return "年级";
    }else{
      return gradeOptionList[ind].text;
    }
  },
  studyAddress: function(){
    return this.setAddRess == "setAddRess" ? Session.get("locationAddress") : false;
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
    Router.go("map")
  }
});
Template.selectTeachSubject.helpers({
  subject: function(){
  }
});
