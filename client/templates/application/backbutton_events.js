if (Meteor.isCordova) {
  var onBackButtonPressed = function(event) {
    console.log("on back-button pressed");
    if ($('body').hasClass('action-sheet-open')) {
      IonActionSheet.close();
      return;
    }
    if ($('body').hasClass('popup-open')) {
      IonPopup.close();
      return;
    }
    var curRouter = Router.current();
    var curRouterName = curRouter.route.getName();
    console.log("curRouterName is: "+curRouterName);
    if (curRouterName==="dashboard" || curRouterName==="teachers" || curRouterName==="home") {
      IonPopup.confirm({
        title: 'Exit hint?',
        template: 'Are you sure to exit app!?',
        onOk: function() {
          console.log('Exit app!');
          navigator.app && navigator.app.exitApp && navigator.app.exitApp();
        },
        onCancel: function() {}
      });
    } else {
      if (Meteor.user()) {
        if (Meteor.user().role=='parent') {
          Router.go('teachers');
        } else {
          Router.go('dashboard');
        }
      } else {
        Router.go('home');
      }
    }
  };
  document.addEventListener("backbutton", onBackButtonPressed, false);
}