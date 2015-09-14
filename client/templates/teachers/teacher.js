var maxNavOffsetTop = 0;
var auditMoveHeight = 0;
var evaluationMoveHeight = 0;
var teacherNavHeight = 0;
Template.teacher.onCreated(function(){
  Session.set('hasTabsTop',false);
});
Template.teacher.onRendered(function(){
  var swiper = new Swiper('.teacher-swiper-container', {
      slidesPerView: 3,
      spaceBetween: 7,
      freeMode: true
  });
  var top = $('.above-tabs').outerHeight();

  console.log($('#teacherNav').offset().top);
  console.log($('.app-layout-nav-bar').outerHeight());
  console.log(top);
  $('#teacherNav').affix({
    offset:{
      top: top
    },
    target:$('.teacher-detail')
  });
  $('#teacherNav').on('affix.bs.affix', function(){
    $('#teacherSpInfo').css('padding-top', $('#teacherNav').outerHeight() + 'px');
  });
  $('#teacherNav').on('affix-top.bs.affix', function(){
    $('#teacherSpInfo').css('padding-top', '0');
  });

  $('.teacher-detail').scrollspy({
    target:'#teacherNav'
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
    return this.user && this.user.profile && this.user.profile.serviceArea ? this.user.profile.serviceArea.join(" | ") : "";
  },
  price: function() {
    return TeacherAudit.getTeacherUnitPrice(this.user._id);
  },
  commentInfo: function(){
    return this.comment && this.comment.comment ? this.comment.comment : "";
  },
  commentStars: function(){
    var score = this.comment && this.comment.maScore && this.comment.laScore ? (this.comment.maScore + this.comment.laScore)/2 : 0;
    return genScoreStarsAry(score, 5);
  },
  starClass: function(val){
    return val == 3 ? "ion-ios-star" : val == 2 ? "ion-ios-star-half" : val == 1 ? "ion-ios-star-outline" : "";
  },
  commentUserName: function(){
    return this.comment && this.comment.student && this.comment.student.name ? this.comment.student.name : "";
  },
  commentUserAvatarUrl: function(){
    var avtUrl = "";
    if(this.comment && this.comment.student && this.comment.student.id){
      var u = Meteor.users.findOne({_id: this.comment.student.id});
      avtUrl = u && u.profile.avatarUrl ? u.profile.avatarUrl : "";
    }
    return avtUrl;
  }
});

Template.teacher.events({
  'click #teacherNav li a': function(e) {
    e.preventDefault();
    var des = $(e.target.getAttribute('href'));
    $('.teacher-detail').scrollTo(des);
  },
  'click #tryExperienceCourse': function(e) {
    e.preventDefault();
    var user = Meteor.user();
    var teacher = this.user;
    if(!teacher){
      $(e.currentTarget).addClass("disabled");
    }

    var className = "体验课程";
    var hour = "1";
    var price = "1";
    var cost = "1";

    var queryObj = 'userId=' + user._id +
                   '&teacherId=' + teacher._id +
                   '&className=' + className +
                   '&hour=' + hour +
                   '&price=' + price +
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
  'click #moreEvaluation': function(e){
    e.preventDefault();
    Router.go('comments', {'tid': this.user._id});
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

