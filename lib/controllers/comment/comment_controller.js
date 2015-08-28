CommentController = RouteController.extend({
  waitOn: function(){
    var courseAttendanceId = this.params.cid;
    var courseAttendancesParams = {
      find: {'_id': courseAttendanceId},
      options: {}
    };
    return [
      Meteor.subscribe('courseAttendancesWithTeacher', courseAttendancesParams)
    ];
  },
  data: function(){
    var courseAttendanceId = this.params.cid;
    var teacherId = null, teacher = null;

    var courseAttendance = CourseAttendances.findOne({'_id': courseAttendanceId});
    if(courseAttendance){
      teacher = Meteor.users.findOne({"_id": courseAttendance.teacher.id});
    }
    return {
      teacher: teacher,
      courseAttendance: courseAttendance
    }
  }
});
