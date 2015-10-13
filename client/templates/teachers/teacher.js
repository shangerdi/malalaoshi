Template.teacher.onCreated(function(){
  Session.set('hasTabsTop',false);
  var user = Meteor.user();
  if (user && user.profile && user.profile.serviceArea) { // 上门授课区域
    var serviceArea = user.profile.serviceArea, areaCodes = [];
    if (serviceArea.upperCode) {
      areaCodes.push(serviceArea.upperCode);
    }
    if (!_.isEmpty(serviceArea.areas)) {
      areaCodes = areaCodes.concat(serviceArea.areas);
    }
    Meteor.subscribe('areas', areaCodes);
  }
});
Template.teacher.onRendered(function(){
  var swiper = new Swiper('.teacher-swiper-container', {
      slidesPerView: 3,
      spaceBetween: 7,
      freeMode: true
  });

  $('body').append($('.sticky-nav').clone(true));
  var $fixedNav = $('body>.sticky-nav');
  var $staticNav = $('.teacher-detail .sticky-nav');
  $('.teacher-detail').scroll(function() {
    if ($staticNav.offset().top <= $('.bar-header').outerHeight()) {
      $fixedNav.css('display', 'block');
    }
    else {
      $fixedNav.css('display', 'none');
    }
  });
  $('.teacher-detail').scrollspy({
    target:'.sticky-nav'
  });
  $('.sticky-nav a').click(function(e) {
    e.preventDefault();
    var des = $(e.target).closest('a').attr('href');
    $('.teacher-detail').scrollTo(des);
  });
});
Template.teacher.onDestroyed(function(){
  $('body>.sticky-nav').remove();
});
Template.teacher.helpers({
  subject: function(){
    var stage = "", subject = "";
    var retStr = "";
    if(this.user && this.user.profile && this.user.profile.subjects){
      var subjects = this.user.profile.subjects;
      for(var i=0; i<subjects.length;i++){
        var subject = subjects[i];
        if(i != 0){
          retStr += " | ";
        }
        if(subject.stage){
          retStr += getEduStageText(subject.stage);
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
  maDuStars: function(){
    return genScoreStarsAry(this.user && this.user.profile && this.user.profile.maCount
      && this.user.profile.maScore ? this.user.profile.maScore/this.user.profile.maCount : 0, 5);
  },
  laDuStars: function(){
    return genScoreStarsAry(this.user && this.user.profile && this.user.profile.laCount
      && this.user.profile.laScore ? this.user.profile.laScore/this.user.profile.laCount : 0, 5);
  },
  starImage: function(val){
    return val == 3 ? "star_h.png" : val == 2 ? "star_half.png" : val == 1 ? "star_normal.png" : "";
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
    var user = Meteor.user();
    if (user && user.profile && user.profile.serviceArea) {
      var serviceArea = user.profile.serviceArea, parentArea = null;
      if (serviceArea.upperCode) {
        parentArea = Areas.findOne({'code': serviceArea.upperCode});
      }
      if (!parentArea) {
        return;
      }
      if (_.isEmpty(serviceArea.areas) || serviceArea.areas[0]==serviceArea.upperCode) {
        return parentArea.name;
      }
      var areas = Areas.find({'code': {$in: serviceArea.areas}}).fetch();
      var names = "";
      _.each(areas, function(obj, i) {
        names += obj.name + (i<(areas.length-1)?" | ":"");
      });
      return names;
    }
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
  starImage: function(val){
    return val == 3 ? "star_h.png" : val == 2 ? "star_half.png" : val == 1 ? "star_normal.png" : "";
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
