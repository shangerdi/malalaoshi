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

    if ($('.app-layout-nav-bar>.back-button').length > 0) {
      $('.app-layout-nav-bar>.back-button').click();
      return;
    }

    if ($('#backBtn').length > 0) {
      $('backBtn').click();
      return;
    }

    var curRouter = Router.current();
    var curRouterName = curRouter.route.getName();
    // console.log("curRouterName is: "+curRouterName);
    var parentRouterName = navStack && navStack.findParent(curRouterName);
    // TODO: rewrite navigation stack, ps: path router's data
    // console.log("parentRouterName is: "+parentRouterName);
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
  };
  document.addEventListener("backbutton", onBackButtonPressed, false);
}
