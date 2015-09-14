Template.orderStepPaySuccess.events({
  'click #viewCourseSchedule': function(e) {
    Router.go("scheduleCalendar")
  },
  'click #viewOrder': function(e) {
    Router.go("order", {'id': this.orderId})
  }
});
