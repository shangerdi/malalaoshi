Template.proceedsAddCardStep1.helpers({
  //add you helpers here
});

Template.proceedsAddCardStep1.events({
  //add your events here
});

Template.proceedsAddCardStep1.onCreated(function() {
  //add your statement here
});

Template.proceedsAddCardStep1.onRendered(function() {
  //add your statement here
  $("[data-action=add-card-step2]").click(function(e) {
    Router.go('proceedsAddCardStep2');
  });
});

Template.proceedsAddCardStep1.onDestroyed(function() {
  //add your statement here
});

