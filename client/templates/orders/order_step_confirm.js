Template.orderStepConfirm.onCreated(function(){
  console.log(Session.get("orderTeacherId"));
});
Template.orderStepConfirm.events({
  'click #gotoPay': function(e) {
    Router.go('orderStepPay');
  }
});
