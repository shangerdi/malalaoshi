Template.mineProfileExperiences.onRendered(function(){
  $("[data-action=add-experience]").click(function() {
    Router.go('mineProfileExperience');
  });
});
Template.mineProfileExperiences.helpers({
  isEmpty: function() {
    var teacherAudit = TeacherAudit.findOne({'userId': Meteor.userId()});
    if (!teacherAudit) {
      return true;
    }
    if (!teacherAudit.experience || teacherAudit.experience.length==0) {
      return true;
    }
    return false;
  },
  experienceList: function() {
    var teacherAudit = TeacherAudit.findOne({'userId': Meteor.userId()});
    if (teacherAudit) {
      return teacherAudit.experience;
    }
  }
});
