CommentedController = RouteController.extend({
  data: function(){
    var courseAttendanceId = this.params.cid;
    return {
      courseAttendanceId: courseAttendanceId
    }
  }
});
