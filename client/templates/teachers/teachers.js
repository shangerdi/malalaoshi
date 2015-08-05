Template.selectTeachSubject.onCreated(function(){
  var subjectDict = getEduSubjectDict(), subjectOptionList=[];
  subjectOptionList.push({key:"all",text:"-全部-"});
  _.each(subjectDict, function(obj){
    subjectOptionList.push({key:obj.key, text:obj.text});
  });

  this.data.eduSubjectList = subjectOptionList;

  var gradeDict = getEduGradeDict(), gradeOptionList=[];
  gradeOptionList.push({key:"all",text:"-全部-"});
  _.each(gradeDict, function(obj){
    gradeOptionList.push({key:obj.key, text:obj.text});
  });

  this.data.eduGradeList = gradeOptionList;
});

Template.teachers.onRendered(function () {
  IonNavigation.skipTransitions = true;
});
Template.teacherItem.onCreated(function() {
  this.data.user = Meteor.users.findOne({_id: this.data.userId});
});

Template.teacherItem.helpers({
  eduAudit: function(){
    if(this.status && this.status.edu == "approved"){
      return true;
    }
    return false;
  },
  cert: function(){
    if(this.status && this.status.cert == "approved"){
      return true;
    }
    return false;
  },
  subject: function(){
    var school = "", subject = "";
    if(this.profile && this.profile.subjects){
      var subjects = this.profile.subjects[0];
      if(subjects){
        if(subjects.subject){
          subject = getEduSubjectText(subjects.subject);
        }
        if(subjects.school){
          school = getEduSchoolText(subjects.school);
        }
      }
    }
    return school + subject;
  }
});

Template.selectTeachSubject.events({
  'submit form': function(e){
    e.preventDefault();
    var curForm = e.target;

    var subject = this.eduSubjectList[this.swiperSubject.activeIndex];
    if(subject){
      Session.set('teachersSubject', subject.key);
    }
    var grade = this.eduGradeList[this.swiperGrade.activeIndex];
    if(grade){
      Session.set('teachersGrade', grade.key);
    }
    IonModal.close();
    IonKeyboard.close();
  }
});
Template.selectTeachSubject.helpers({
  subject: function(){
    var subject = Session.get('teachersSubject');
    if(!subject){
      subject = "all";
    }
    return subject;
  },
  grade: function(){
    var grade = Session.get('teachersGrade');
    if(!grade){
      grade = "all";
    }
    return grade;
  }
});
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
Template.selectTeachSubject.onRendered(function(){
  this.data.swiperSubject = new Swiper('.swiper-subject', {
    slidesPerView: 9,
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
    slidesPerView: 9,
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
    swiper.container.find("div>div").removeClass("swiper-slide-in");
    if(select != null){
      swiper.container.find("div>div:eq("+select+")").addClass("swiper-slide-in");
    }
  });
  this.data.swiperGrade.on("setTranslate", function(swiper, translate){
    var select = getSwiperSlideInWindow(swiper, translate);
    swiper.container.find("div>div").removeClass("swiper-slide-in");
    if(select != null){
      swiper.container.find("div>div:eq("+select+")").addClass("swiper-slide-in");
    }
  });
  var subject = Session.get('teachersSubject');
  if(!subject){
    subject = "all";
  }
  var swiperSubject = this.data.swiperSubject;
  _.each(this.data.eduSubjectList, function(obj, ind){
    if(obj.key == subject){
      swiperSubject.slideTo(ind, 0, null);
    }
  });
  var grade = Session.get('teachersGrade');
  if(!grade){
    grade = "all";
  }
  var gradeSubject = this.data.swiperGrade;
  _.each(this.data.eduGradeList, function(obj, ind){
    if(obj.key == grade){
      gradeSubject.slideTo(ind, 0, null);
    }
  });
});
