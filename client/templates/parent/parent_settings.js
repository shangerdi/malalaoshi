Template.parentSettings.events({
  'click .btn-logout': function(e) {
    var doLogout = function() {
      // console.log(Meteor.userId() + ' logout!');
      Meteor.logout();
      Router.go('home');
    };
    if (Meteor.isCordova) {
      IonPopup.confirm({
        title: 'Logout hint?',
        template: 'Are you sure to logout!?',
        onOk: doLogout,
        onCancel: function() {}
      });
    } else {
      doLogout();
    }
  }
});
