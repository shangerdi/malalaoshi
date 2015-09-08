var getSelectedSubjects = function() {
  return Session.get('subjects');
}
var getSubjectStr = function(obj) {
  var s = '';
  if(obj) {
    if (obj.school) {
      s += getEduSchoolText(obj.school);
    }
    if (obj.grade && obj.grade!=='all') {
      s += getEduGradeText(obj.grade);
    }
    if (obj.subject) {
      s += getEduSubjectText(obj.subject);
    }
  }
  return s;
}
Template.applicationInfo.onRendered(function(){
  var n=6, u=44, width=u*n;
  this.teachingAgeSwiper = new Swiper('.swiper-container', {
    slidesPerView: n,
    width: width,
    freeMode: true,
    freeModeMomentum: true,
    freeModeMomentumRatio: 0.3,
    freeModeMomentumBounce: true,
    freeModeMomentumBounceRatio: 0.01,
    freeModeSticky: true,
    centeredSlides: true
  });
  $(".swiper-wrapper").width(width);
  var subjects = Meteor.user().profile.subjects;
  Session.set('subjects', subjects?subjects:[]);
  var address = Meteor.user().profile.address;
  if (address && address.city && address.city.code==='410300') {
    $("input[name=city][value=luoyang]").attr("checked", true);
  } else {
    $("input[name=city][value=other]").attr("checked", true);
  }
});
Template.applicationInfo.helpers({
  teachYearNums: function() {
    var a=[];
    for (i=1;i<=20;i++) {
      a.push(i);
    }
    return a;
  },
  hasSubjects: function() {
    var a = getSelectedSubjects();
    return a && a.length;
  },
  selectedSubjects: function() {
    return getSelectedSubjects();
  },
  getSubjectStr: function(obj) {
    return getSubjectStr(obj);
  },
  getErrorMsg: function(field) {
    if (Session.get("errors")) {
      return Session.get("errors")[field];
    }
  }
});
var checkProfile = function(info) {
  var error = {hasError: false};
  if (!info.name || info.name.trim()==='') {
    error.hasError = true;
    error.name = "请填写您的姓名";
  }
  if (!info.gender) {
    error.hasError = true;
    error.gender = "请选择性别";
  }
  if (!info.subjects || !info.subjects.length) {
    error.hasError = true;
    error.subjects = "请至少添加一项您擅长的教学科目";
  }
  if (!info.city) {
    error.hasError = true;
    error.city = "请选择您所在的城市";
  }
  return error;
}
Template.applicationInfo.events({
  'click #submitInfo': function() {
    Session.set("errors", {});
    var profile = {};
    profile.name = $("input[name=name]").val();
    profile.gender = $("input[name=gender]:checked").val();
    profile.teachingAge = Template.instance().teachingAgeSwiper.activeIndex + 1;
    profile.subjects = getSelectedSubjects();
    profile.city = $("input[name=city]:checked").val();
    // console.log(profile);
    var errors = checkProfile(profile);
    if (errors && errors.hasError) {
      Session.set("errors", errors);
      return;
    }
    if (profile.city==='luoyang') {
      profile.address = {'province':{'code': "410000", 'name': "河南"}, 'city': {'code': "410300", 'name': "洛阳市"}, 'district': {'code': "410301", 'name': "市辖区"}};
    }
    profile.city=null;

    Meteor.call('submitApplyProfile', profile, function(error, result) {
      if (error) {
        Session.set("errors", {city: error.reason});
        return throwError(error.reason);
      }
      Router.go('applicationProgress');
    });
  },
  'click input': function(e) {
    var errors = Session.get("errors");
    if (!errors) {
      return;
    }
    var ele = e.target;
    var name = ele.name;
    errors[name]='';
    Session.set("errors", errors);
  }
});
