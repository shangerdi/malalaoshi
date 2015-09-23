Template.proceedsPassword.helpers({
  //add you helpers here
});

Template.proceedsPassword.events({
  //add your events here
});

Template.proceedsPassword.onCreated(function() {
  //add your statement here
  IonKeyboard.show();
});

Template.proceedsPassword.onRendered(function() {
  //add your statement here
  $("[data-action=my-cards]").click(function(e) {
    alert('设置密码成功!');
    Router.go('proceedsMyCards');
  });
});

Template.proceedsPassword.onDestroyed(function() {
  //add your statement here
  IonKeyboard.close();
});

