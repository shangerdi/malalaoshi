Template.orderCourseConfirm.onCreated(function(){
  console.log(Session.get("orderTeacherId"));
});
Template.orderCourseConfirm.events({
  'click #gotoPay': function(e) {
    Router.go('orderCoursePay');
  }
});
