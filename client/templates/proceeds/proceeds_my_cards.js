Template.proceedsMyCards.helpers({
  //add you helpers here
  teacherBalance: function() {
    return TeacherBalance.findOne();
  }
});

Template.proceedsMyCards.events({
  //add your events here
});

Template.proceedsMyCards.onCreated(function() {
  //add your statement here
});

Template.proceedsMyCards.onRendered(function() {
  //add your statement here
  $("[data-action=add-card-step1]").click(function(e) {
    Router.go('proceedsAddCardStep1');
  });
});

Template.proceedsMyCards.onDestroyed(function() {
  //add your statement here
});

