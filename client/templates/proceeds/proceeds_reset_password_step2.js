Template.proceedsResetPasswordStep2.helpers({
  //add you helpers here
});

Template.proceedsResetPasswordStep2.events({
  //add your events here
  'click [data-action=identity-verify]': function() {
    var params = {};
    params.cardUserName = $("#cardUserName").val();
    params.IDNumber = $("#IDNumber").val();
    params.cardNumber = $("#cardNumber").val();
    Meteor.call('identityVerify', params, function(error, result) {
      if (error) {
        alert(error.reason);
        return throwError(error.reason);
      }

      Router.go('proceedsPassword');
    });
  }
});

Template.proceedsResetPasswordStep2.onCreated(function() {
  //add your statement here
});

Template.proceedsResetPasswordStep2.onRendered(function() {
  //add your statement here
});

Template.proceedsResetPasswordStep2.onDestroyed(function() {
  //add your statement here
});
