Template.mineProfileEduResults.helpers({
  eduResultList: function() {
    var teacherAudit = TeacherAudit.findOne({'userId': Meteor.userId()});
    if (teacherAudit) {
      return teacherAudit.eduResults;
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
