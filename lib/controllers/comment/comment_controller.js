CommentController = RouteController.extend({
  waitOn: function(){
    var teacherId = this.params.uid;
    var courseAttendanceId = this.params.cid;
    var courseAttendancesParams = {
      find: {'_id': courseAttendanceId},
      options: {}
    };
    return [
      Meteor.subscribe('teacher', teacherId),
      Meteor.subscribe('courseAttendances', courseAttendancesParams)
    ];
  },
  data: function(){
    var teacherId = this.params.uid;
    var courseAttendanceId = this.params.cid;

    var teacher = Meteor.users.findOne({"_id": teacherId});
    var courseAttendance = CourseAttendances.findOne({'_id': courseAttendanceId});
    return {
      teacher: teacher,
      courseAttendance: courseAttendance
    }
  }
});
