Template.mineProfileEduResults.helpers({
  eduResultList: function() {
    var teacherAudit = TeacherAudit.findOne({'userId': Meteor.userId()});
    if (teacherAudit) {
      return teacherAudit.eduResults;
    }
  }
});
