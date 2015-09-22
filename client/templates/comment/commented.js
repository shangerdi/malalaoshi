Template.commented.events({
  'click #doMoreConfirm': function(e){
    e.preventDefault();
    Router.go('coursesConfirmed');
  },
  'click #getCoupon': function(e){
    e.preventDefault();
    Router.go('raffle', {'cid': this.courseAttendanceId});
  }
});
