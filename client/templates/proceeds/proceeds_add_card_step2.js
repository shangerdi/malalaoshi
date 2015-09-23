Template.proceedsAddCardStep2.helpers({
  //add you helpers here
});

Template.proceedsAddCardStep2.events({
  //add your events here
});

Template.proceedsAddCardStep2.onCreated(function() {
  //add your statement here
});

Template.proceedsAddCardStep2.onRendered(function() {
  //add your statement here
  $("[data-action=add-card-step3]").click(function(e) {
    Router.go('proceedsAddCardStep3');
  });
});

Template.proceedsAddCardStep2.onDestroyed(function() {
  //add your statement here
});

