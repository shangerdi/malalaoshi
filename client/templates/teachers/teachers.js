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
    centeredSlides: true,
    onSliderMove: function(swiper, event){
      //console.log(swiper);
    },
    onTouchEnd: function(swiper, event){
      console.log(swiper);
    }
  });
/**
  this.data.swiperGrade.on("sliderMove", function(a, b, c, d, e, f, g){
    console.log("....................a...............");
    console.log(a);
    console.log(b);
    console.log(c);
    console.log(d);
    console.log(e);
    console.log(f);
    console.log(g);
    console.log("....................b...............");
  });
*/




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
