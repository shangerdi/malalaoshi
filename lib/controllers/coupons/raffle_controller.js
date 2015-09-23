RaffleController = RouteController.extend({
  data: function(){
    var cid = this.params.cid;
    return {
      courseAttendanceId: cid
    }
  }
});
