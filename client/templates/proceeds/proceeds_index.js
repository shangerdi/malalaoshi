Template.proceedsIndex.helpers({
  //add you helpers here
});

Template.proceedsIndex.events({
  //add your events here
});

Template.proceedsIndex.onCreated(function() {
  //add your statement here
});

Template.proceedsIndex.onRendered(function() {
  //add your statement here
  $("[data-action=proceeds-security]").click(function(e) {
    Router.go('proceedsSecurity');
  });
  $("[data-action=proceeds-withdraw]").click(function(e) {
    Router.go('proceedsWithdraw');
  });
});

Template.proceedsIndex.onDestroyed(function() {
  //add your statement here
});

