CommentController = RouteController.extend({
  waitOn: function(){
    var courseAttendanceId = this.params.cid;
    var courseAttendancesParams = {
      find: {'_id': courseAttendanceId},
      options: {}
    };
    var commentParams = {
      find: {'courseAttendanceId': courseAttendanceId},
      options: {sort: {createdAt: -1 }, limit: 1}
    }
    return [
      Meteor.subscribe('courseAttendancesWithTeacher', courseAttendancesParams),
      Meteor.subscribe('comments', commentParams)
    ];
  },
  data: function(){
    var courseAttendanceId = this.params.cid;
    var teacherId = null, teacher = null;

    var courseAttendance = CourseAttendances.findOne({'_id': courseAttendanceId});
    if(courseAttendance){
      teacher = Meteor.users.findOne({"_id": courseAttendance.teacher.id});
    }
    var comment = Comment.findOne({'courseAttendanceId': courseAttendanceId});
    return {
      teacher: teacher,
      courseAttendance: courseAttendance,
      comment: comment
    }
  }
});
