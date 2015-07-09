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
    var subject = $(curForm).find('[name=subject]').val();
    var grade = $(curForm).find('[name=grade]').val();
    Session.set('teachersSubject', subject);
    Session.set('teachersGrade', grade);
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
  },
  eduSubjectList: function(val) {
    var a = getEduSubjectDict(), optionList=[];
    optionList.push({key:"all",text:" - 全部 - "});
    _.each(a, function(obj){
      var newObj = {key:obj.key, text:obj.text};
      if (obj.key==val) {
        newObj.selected=true;
      }
      optionList.push(newObj);
    });
    return optionList;
  },
  eduGradeList: function(val) {
    var a = getEduGradeDict(), optionList=[];
    var newObj = {key:"all", text:"- 全部 -"};
    if (val==="all") {
      newObj.selected=true;
    }
    optionList.push(newObj);
    _.each(a, function(obj){
      var newObj = {key:obj.key, text:obj.text};
      if (_.isArray(val)) {
        if (_.contains(val, obj.key)){
          newObj.selected=true;
        }
      } else {
       if (obj.key==val) {
          newObj.selected=true;
        }
      }
      optionList.push(newObj);
    });
    return optionList;
  }
});
