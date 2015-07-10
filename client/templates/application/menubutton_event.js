if(Meteor.isCordova) {

var toggleIonActionSheet = function() {
  if (!Meteor.userId()) {
    return;
  }
  if ($('body').hasClass('action-sheet-open')) {
    IonActionSheet.close();
    return;
  }
  IonActionSheet.show({
    titleText: false,
    buttons: [
      { text: '设置 <i class="icon ion-settings"></i>' }
    ],
    destructiveText: false,
    cancelText: '取消',
    cancel: function() {
    },
    buttonClicked: function(index) {
      if (index === 0) {
        Router.go("parentSettings");
      }
      return true;
    },
    destructiveButtonClicked: function() {
      return true;
    }
  });
}
  document.addEventListener("menubutton", toggleIonActionSheet, false);
}