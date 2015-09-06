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
  this.teachYearsSwiper = new Swiper('.swiper-container', {
    slidesPerView: 'auto',
    centeredSlides: true
  });
  var subjects = Meteor.user().profile.subject;
  Session.set('subjects', subjects?subjects:[]);
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
  }
});
Template.applicationInfo.events({
  'click #submitInfo': function() {
    // TODO 提交申请资料
    console.log('submitInfo');
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
