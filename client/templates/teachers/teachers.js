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
