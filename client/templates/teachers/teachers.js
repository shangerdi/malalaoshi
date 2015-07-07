Template.teachers.onRendered(function () {
});

Template.teacherItem.onCreated(function() {
  this.data.user = Meteor.users.findOne({_id: this.data.userId});
});
Template.teacherItem.helpers({
  eduAudit: function(){
    if(this.eduInfo && this.eduInfo.status && this.eduInfo.status == "approved"){
      return true;
    }
    return false;
  },
  cert: function(){
    if(this.certInfo && this.certInfo.status && this.certInfo.status == "approved"){
      return true;
    }
    return false;
  },
  subject: function(){
    var school = "", subject = "";
    if(this.user && this.user.profile && this.user.profile.subjects){
      var subjects = this.user.profile.subjects[0];
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
