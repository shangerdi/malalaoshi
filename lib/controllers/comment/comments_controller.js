CommentsController = RouteController.extend({
  waitOn: function(){
    var teacherId = this.params.tid;
    return [
      Meteor.subscribe('teacher', teacherId),
      Meteor.subscribe('userSummary', teacherId)
    ];
  },
  data: function(){
    if(this.ready()){
      var teacherId = this.params.tid;
      var teacher = Meteor.users.findOne({"_id": teacherId});
      var teacherAudit = TeacherAudit.findOne({'userId': teacherId});
      var userSummary = UserSummary.findOne({'userId': teacherId});
      return {
        teacher: teacher,
        teacherAudit: teacherAudit,
        userSummary: userSummary
      }
    }
  }
});
