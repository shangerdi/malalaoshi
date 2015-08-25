var maxNavOffsetTop = 0;
var auditMoveHeight = 0;
var evaluationMoveHeight = 0;
Template.teacher.onCreated(function(){
  Session.set('hasTabsTop',false);
});
Template.teacher.onRendered(function(){
  IonNavigation.skipTransitions = true;
  Session.set('teacherDetialPageAcitveTab', null);
  maxNavOffsetTop = $("#teacherNav").offset().top - $(".teacher-detail").offset().top;
  auditMoveHeight = $('#teacherAudit').position().top - $("#teacherNav").outerHeight(true) - $("#teacherNav").outerHeight() - 20;
  evaluationMoveHeight = $('#teacherEvaluation').position().top - $("#teacherNav").outerHeight(true) - $("#teacherNav").outerHeight() + 1;
  $('.teacher-detail').scroll(function(){
    if($('.teacher-detail').scrollTop() >= maxNavOffsetTop){
      $('#teacherNav').addClass('teacher-detail-nav-fixed');
    }else{
      $('#teacherNav').removeClass('teacher-detail-nav-fixed');
    }
  });

  var swiper = new Swiper('.teacher-swiper-container', {
      slidesPerView: 3,
      spaceBetween: 7,
      freeMode: true
  });
});
Template.teacher.helpers({
  starLevelAry: function(){
    return doStarLevelAry(this.user);
  },
  genderFemale: function(v){
    return this.user.profile && this.user.profile.gender == '女';
  },
  genderMale: function(){
    return this.user && this.user.profile && this.user.profile.gender == '男';
  },
  subject: function(){
    var school = "", subject = "";
    var retStr = "";
    if(this.user && this.user.profile && this.user.profile.subjects){
      var subjects = this.user.profile.subjects;
      for(var i=0; i<subjects.length;i++){
        var subject = subjects[i];
        if(i != 0){
          retStr += " | ";
        }
        if(subject.school){
          retStr += getEduSchoolText(subject.school);
        }
        if(subject.subject){
          retStr += getEduSubjectText(subject.subject);
        }
      }
    }
    return retStr;
  },
  colleges: function(){
    var ret = [];
    if(this.userEdu && this.userEdu.eduItems){
      var edus = this.userEdu.eduItems;
      _.each(edus, function(item) {
        ret[ret.length] = item.college + " | " + getEduDegreeText(item.degree);
      });
    }
    return ret;
  },
  eduAudit: function(){
    return this.user && this.user.status && this.user.status.edu == "approved";
  },
  cert: function(){
    return this.user && this.user.status && this.user.status.cert == "approved";
  },
  submitActiv: function(){
    return !this.user;
  },
  activeTabClass: function(id){
    var actId = Session.get('teacherDetialPageAcitveTab');
    if(actId == id){
      return "teacher-detail-tab-active";
    }
    return "";
  },
  experience: function(){
    //TODO add database
    return "";
  },
  eduResults: function(){
    //TODO add database
    return "";
  },
  personalPhoto: function(){
    //TODO add database
    var test = [
      "https://s3-ap-southeast-1.amazonaws.com/my.images.head/12222222226/1437104338352.jpg",
      "https://s3-ap-southeast-1.amazonaws.com/my.images.head/12222222223/1437104448883.jpg",
      "https://s3-ap-southeast-1.amazonaws.com/my.images.head/12222222228/1437104277843.jpg",
      "https://s3-ap-southeast-1.amazonaws.com/my.images.head/12222222229/1437104183029.jpg",
      "https://s3-ap-southeast-1.amazonaws.com/my.images.head/12222222225/1437104374691.jpg"
    ];

    return test;
  },
  maDu: function(){
    return accounting.formatNumber(this.user && this.user.profile && this.user.profile.maCount
      && this.user.profile.maScore ? this.user.profile.maScore/this.user.profile.maCount : 0, 1);
  },
  laDu: function(){
    return accounting.formatNumber(this.user && this.user.profile && this.user.profile.laCount
      && this.user.profile.laScore ? this.user.profile.laScore/this.user.profile.laCount : 0, 1);
  },
  commendStudyCenter: function(){
    return {
      avatar: "https://s3-ap-southeast-1.amazonaws.com/my.images.head/12222222226/1437104338352.jpg",
      name: "麻辣学习中心",
      city: "北京",
      address: "北京市大望路10号",
      distance: 500
    };
  }
});

Template.teacher.events({
  'click #tryExperienceCourse': function(e) {
    e.preventDefault();
    var user = Meteor.user();
    var teacher = this.user;
    if(!teacher){
      $(e.currentTarget).addClass("disabled");
    }

    var className = "体验课程";
    var hour = "1";
    var unitCost = "1";
    var cost = "1";

    var queryObj = 'userId=' + user._id +
                   '&teacherId=' + teacher._id +
                   '&className=' + className +
                   '&hour=' + hour +
                   '&unitCost=' + unitCost +
                   '&cost=' + cost;

    Router.go('order', {}, {query: queryObj});
  },
  'click #reserveCourse': function(e){
    e.preventDefault();
    Session.set('orderTeacherId', this.user._id);
    Router.go('orderStepSchedule');
  },
  'click #moreEduResults': function(e){
    e.preventDefault();
    if($('#eduReults').height() == 52){
      $('#eduReults').css('height', '100%');
    }else{
      $('#eduReults').css('height', '52px');
    }
  },
  'click #moreExperience': function(e){
    e.preventDefault();
    if($('#experience').height() == 76){
      $('#experience').css('height', '100%');
    }else{
      $('#experience').css('height', '76px');
    }
  }
});
Template.teacher.events({
  'click #mainPage': function(e){
    e.preventDefault();
    Session.set('teacherDetialPageAcitveTab', "mainPage");
    $('.teacher-detail').scrollTo(auditMoveHeight+'px',500);
  },
  'click #evaluation': function(e){
    e.preventDefault();
    Session.set('teacherDetialPageAcitveTab', "evaluation");
    $('.teacher-detail').scrollTo(evaluationMoveHeight+'px',500);
  }
});
function doStarLevelAry(self){
  var ary = [];
  if(self.profile && self.profile.starLevel){
    for(var i=0; i<self.profile.starLevel; i++){
      ary[i] = 0;
    }
  }
  if(ary.length < 5){
    for(var i = ary.length; i < 5; i++){
      ary[i] = 1;
    }
  }
  return ary;
}
