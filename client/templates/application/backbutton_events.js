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
    var parentRouterName = navStack && navStack.findParent(curRouterName);
    // TODO: rewrite navigation stack, ps: path router's data
    console.log("parentRouterName is: "+parentRouterName);
    if (!parentRouterName) {
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
      Router.go(parentRouterName);
    }
  };
  document.addEventListener("backbutton", onBackButtonPressed, false);
}