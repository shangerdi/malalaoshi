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
Template.subjectsEditComponent.onRendered(function(){
  $('#elementary').addClass('active');
  $('a[aria-controls="elementary"]').closest('li').addClass('active');
  $('#elementary').tab('show');
});
Template.subjectsEditComponent.helpers({
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
        return tmp.school===school && (tmp.grade===grade || tmp.grade==='all') && tmp.subject===obj.key;
      });
      if (isSelected) {
        return false;
      }
      a.push({'key':obj.key, 'text':obj.text});
    });
    return a;
  }
});
Template.subjectsEditComponent.events({
  'click .btn-add-subject': function(e) {
    var ele = e.target, $ele = $(ele), $subjectItem = $ele.closest('.subject-item');
    var school = $subjectItem.attr('school'), grade = $subjectItem.attr('grade'), subject = $subjectItem.attr('subject');
    var subjects = getSelectedSubjects();
    // 去重（或全部年级时去除单个已选年级）
    subjects = _.reject(subjects, function(tmp){
      return tmp.school===school && (tmp.grade===grade || grade==='all') && tmp.subject===subject;
    });
    if (subjects && subjects.length >= maxSubjectsCount) {
      alert('最多可以添加'+maxSubjectsCount+'个科目');
      return;
    }
    // 添加新的
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
