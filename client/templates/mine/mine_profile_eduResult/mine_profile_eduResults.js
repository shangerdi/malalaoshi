Template.mineProfileEduResults.onRendered(function(){
  $("[data-action=add-eduResult]").click(function() {
    Router.go('mineProfileEduResult');
  });
});
Template.mineProfileEduResults.helpers({
  isEmpty: function() {
    var teacherAudit = TeacherAudit.findOne({'userId': Meteor.userId()});
    if (!teacherAudit) {
      return true;
    }
    if (!teacherAudit.eduResults || teacherAudit.eduResults.length==0) {
      return true;
    }
    return false;
  },
  eduResultList: function() {
    var teacherAudit = TeacherAudit.findOne({'userId': Meteor.userId()});
    if (teacherAudit) {
      return teacherAudit.eduResults;
    }
  }
});
