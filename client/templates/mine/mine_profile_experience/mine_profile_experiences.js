Template.mineProfileExperiences.helpers({
  experienceList: function() {
    var teacherAudit = TeacherAudit.findOne({'userId': Meteor.userId()});
    if (teacherAudit) {
      return teacherAudit.experience;
    }
  }
});
