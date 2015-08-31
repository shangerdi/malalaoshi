var maxNavOffsetTop = 0;
var auditMoveHeight = 0;
var evaluationMoveHeight = 0;
var teacherNavHeight = 0;
Template.teacher.onCreated(function(){
  Session.set('hasTabsTop',false);
});
Template.teacher.onRendered(function(){
  var self = this;
  //on Android (< 2.3) devices, elements that are set to position: fixed; in CSS behave as if they are ‘static’ or part of the normal document flow
  var addNavElement = '' +
  '  <div class="teacher-detail-tab-content nav-fixed-top" id="teacherNavStatic"> ' +
  '    <div id="mainPage" class="teacher-detail-tab">个人资料</div> ' +
  '    <div id="evaluation" class="teacher-detail-tab">评价</div> ' +
  '  </div>';

  $('body').append(addNavElement);

  $('#mainPage').click(mainPageClick);
  $('#evaluation').click(evaluationClick);

  IonNavigation.skipTransitions = true;
  Session.set('teacherDetialPageAcitveTab', null);
  var detailScrollTop = $('.teacher-detail').scrollTop();
  var teacherDetailOffTop = $(".teacher-detail").offset().top;
  var barHeaderHeight = $(".bar-header").outerHeight(true);
  var navStaticHeight = $("#teacherNavStatic").outerHeight(true);
  teacherNavHeight = $("#teacherNav").outerHeight();
  maxNavOffsetTop = $("#teacherNav").offset().top - $(".teacher-detail").offset().top + detailScrollTop;
  auditMoveHeight = detailScrollTop + $("#teacherAudit").offset().top - barHeaderHeight - navStaticHeight;
  evaluationMoveHeight = detailScrollTop + $("#teacherEvaluation").offset().top - barHeaderHeight - navStaticHeight;
  $('.teacher-detail').scroll(function(){
    if($("#teacherNav").offset().top <= teacherDetailOffTop){
      $('#teacherNavStatic').css('display','block');
    }else{
      $('#teacherNavStatic').css('display','none');
    }
  });
  var swiper = new Swiper('.teacher-swiper-container', {
      slidesPerView: 3,
      spaceBetween: 7,
      freeMode: true
  });
  self.autorun(function(){
    var actId = Session.get('teacherDetialPageAcitveTab');
    if(actId == "mainPage"){
      $('#mainPage').addClass('teacher-detail-tab-active');
      $('#evaluation').removeClass('teacher-detail-tab-active');
    }else if(actId == "evaluation"){
      $('#evaluation').addClass('teacher-detail-tab-active');
      $('#mainPage').removeClass('teacher-detail-tab-active');
    }
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
  teachingCert: function(){
    return this.user && this.user.status && this.user.status.teachingCert == "approved";
  },
  specialty: function(){
    return this.user && this.user.status && this.user.status.specialty == "approved";
  },
  maLaCert: function(){
    return this.user && this.user.status && this.user.status.maLaCert == "approved";
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
    return this.teacherAudit && this.teacherAudit.experience || "";
  },
  eduResults: function(){
    return this.teacherAudit && this.teacherAudit.eduResults || "";
  },
  personalPhoto: function(){
    return this.teacherAudit && this.teacherAudit.personalPhoto ? this.teacherAudit.personalPhoto : [];
  },
  maDu: function(){
    return accounting.formatNumber(this.user && this.user.profile && this.user.profile.maCount
      && this.user.profile.maScore ? this.user.profile.maScore/this.user.profile.maCount : 0, 1);
  },
  laDu: function(){
    return accounting.formatNumber(this.user && this.user.profile && this.user.profile.laCount
      && this.user.profile.laScore ? this.user.profile.laScore/this.user.profile.laCount : 0, 1);
  },
  teacherStudyCenters: function(){
    var pointBasic = Session.get("locationLngLat");
    var retStudyCenters = [];
    if(this.studyCenters){
      this.studyCenters.forEach(function(element){
        element.distance = pointBasic ? calculateDistance({lat: element.lat, lng: element.lng}, pointBasic) : null;
        retStudyCenters[retStudyCenters.length] = element;
      });
    }
    retStudyCenters.sort(compDistance);
    return retStudyCenters;
  },
  activeServiceArea: function(){
    return this.user && this.user.profile && this.user.profile && this.user.profile.serviceArea ? this.user.profile.serviceArea.join(" | ") : "";
  },
  unitCost: function() {
    return TeacherAudit.getTeacherUnitPrice(this.user._id);
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
  },
  'click #mainPageInScroll': function(e){
    mainPageClick(e);
  },
  'click #evaluationInScroll': function(e){
    evaluationClick(e);
  }
});
Template.teacherPersonalPhotosShow.onCreated(function(){
  this.data.personalPhotos = this.data && this.data.teacherId ? TeacherAudit.findOne({'userId': this.data.teacherId}).personalPhoto : [];
});
Template.teacherPersonalPhotosShow.onRendered(function(){
  var swiper = new Swiper('.teacher-swiper-container-modal', {
      slidesPerView: 1,
      spaceBetween: 0
  });
});
Template.teacher.onDestroyed(function(){
  $('#teacherNavStatic').remove();
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
var mainPageClick = function(e){
  e.preventDefault();
  Session.set('teacherDetialPageAcitveTab', "mainPage");
  $('.teacher-detail').scrollTo(auditMoveHeight+'px',500);
}
var evaluationClick = function(e){
  e.preventDefault();
  Session.set('teacherDetialPageAcitveTab', "evaluation");
  $('.teacher-detail').scrollTo(evaluationMoveHeight+'px',500);
}
