var maxSubjectsCount = 4;
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
  this.teachingAgeSwiper = new Swiper('.swiper-container', {
    slidesPerView: 'auto',
    centeredSlides: true
  });
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


Template._subjectsModal.onRendered(function(){
  $('#elementary').addClass('active');
  $('a[aria-controls="elementary"]').closest('li').addClass('active');
  $('#elementary').tab('show');
});
Template._subjectsModal.helpers({
  selectedSubjects: function() {
    return getSelectedSubjects();
  },
  getSubjectStr: function(obj) {
    return getSubjectStr(obj);
  },
  getEduSchools: function() {
    var a=[], d = getEduSchoolDict();
    _.each(d, function(obj) {
      a.push({'key':obj.key,'text':obj.text});
    });
    return a;
  },
  getEduGrades: function(school) {
    var d = getEduGradeDict(), a = [];
    var schText = getEduSchoolText(school);
    _.each(d, function(obj) {
      if (obj.key.indexOf(school) < 0) {
        return false;
      }
      a.push({'key':obj.key, 'text':schText+obj.text});
    });
    return a;
  },
  getEduSubjects: function(school, grade) {
    var d = getEduSubjectDict(), a = [], s = getSelectedSubjects();
    _.each(d, function(obj) {
      if (school == 'elementary' && !obj.only_elementary) {
        return false;
      }
      // 过滤掉已选择的
      var isSelected = _.find(s, function(tmp) {
        return tmp.school===school && tmp.grade===grade && tmp.subject===obj.key;
      });
      if (isSelected) {
        return false;
      }
      a.push({'key':obj.key, 'text':obj.text});
    });
    return a;
  }
});
Template._subjectsModal.events({
  'click .btn-add-subject': function(e) {
    var ele = e.target, $ele = $(ele), $subjectItem = $ele.closest('.subject-item');
    var school = $subjectItem.attr('school'), grade = $subjectItem.attr('grade'), subject = $subjectItem.attr('subject');
    var subjects = getSelectedSubjects();
    if (subjects && subjects.length >= maxSubjectsCount) {
      alert('最多可以添加'+maxSubjectsCount+'个科目');
      return;
    }
    subjects.push({'school': school, 'subject': subject, 'grade': grade});
    Session.set('subjects', subjects);
    var errors = Session.get("errors");
    if (errors) {
      errors['subjects']='';
      Session.set("errors", errors);
    }
  },
  'click .selected-subjects span': function(e) {
    var ele = e.target, $ele = $(ele), $ele = $ele.closest(".subject");
    var school = $ele.attr('school'), grade = $ele.attr('grade'), subject = $ele.attr('subject');
    var subjects = getSelectedSubjects();
    subjects = _.reject(subjects, function(tmp) {
      return tmp.school===school && tmp.grade===grade && tmp.subject===subject;
    });
    Session.set('subjects', subjects);
  }
});
