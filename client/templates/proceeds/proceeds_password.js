Template.proceedsPassword.helpers({
  //add you helpers here
});

Template.proceedsPassword.events({
  //add your events here
  'click [data-action=my-cards]': function() {
    var newPass = $("#withdrawPass").val();
    Meteor.call('resetWithdrawPass', newPass, function(error, result) {
      if (error) {
        alert(error.reason);
        return throwError(error.reason);
      }


      alert('设置密码成功!');
      Router.go('proceedsMyCards');
    });
  }
});

Template.proceedsPassword.onCreated(function() {
  //add your statement here
  IonKeyboard.show();
});

Template.proceedsPassword.onRendered(function() {
  //add your statement here
});

Template.proceedsPassword.onDestroyed(function() {
  //add your statement here
  IonKeyboard.close();
});

