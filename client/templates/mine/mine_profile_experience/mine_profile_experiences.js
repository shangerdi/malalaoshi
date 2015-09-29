Template.mineProfileExperiences.helpers({
  experienceList: function() {
    var teacherAudit = TeacherAudit.findOne({'userId': Meteor.userId()});
    if (teacherAudit) {
      return teacherAudit.experience;
    }
  },
  formatDate: function(datetime) {
    var momentObj = moment(parseInt(datetime));
    if (!momentObj.isValid()) {
      return datetime;
    }
    return momentObj.format('YYYY年M月D日')
  }
});
