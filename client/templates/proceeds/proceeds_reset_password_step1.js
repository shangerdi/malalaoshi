Template.proceedsResetPasswordStep1.helpers({
  //add you helpers here
  teacherBalance: function() {
    return TeacherBalance.findOne();
  }
});

Template.proceedsResetPasswordStep1.events({
  //add your events here
  'click [data-action=reset-password-step2]': function() {
    Router.go('proceedsResetPasswordStep2');
  }
});

Template.proceedsResetPasswordStep1.onCreated(function() {
  //add your statement here
});

Template.proceedsResetPasswordStep1.onRendered(function() {
  //add your statement here
});

Template.proceedsResetPasswordStep1.onDestroyed(function() {
  //add your statement here
});

