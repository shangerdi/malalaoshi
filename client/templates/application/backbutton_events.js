if (Meteor.isCordova) {
  var onBackButtonPressed = function(event) {
    // console.log("on back-button pressed");
    if ($('body').hasClass('action-sheet-open')) {
      try {
        IonActionSheet.close();
      } catch(ex) {
        IonActionSheetCustom.close();
      }
      return;
    }
    if ($('body').hasClass('popup-open')) {
      IonPopup.close();
      return;
    }
    if ($('body').hasClass('modal-open')) {
      IonModal.close();
      return;
    }

    var curRouter = Router.current();
    var curRouterName = curRouter.route.getName();
    // console.log("curRouterName is: "+curRouterName);
    var parentRouterName = navStack && navStack.findParent(curRouterName);
    // TODO: rewrite navigation stack, ps: path router's data
    // console.log("parentRouterName is: "+parentRouterName);
    if (window.history.length === 0) {
      IonPopup.confirm({
        title: '退出提示',
        template: '您确定要退出应用吗？',
        okText: '确定',
        cancelText: '取消',
        onOk: function() {
          // console.log('Exit app!');
          navigator.app && navigator.app.exitApp && navigator.app.exitApp();
        },
        onCancel: function() {}
      });
    } else {
      window.history.back();
    }
  };
  document.addEventListener("backbutton", onBackButtonPressed, false);
}
