Template.parentSettings.events({
  'click .btn-logout': function(e) {
    var doLogout = function() {
      // console.log(Meteor.userId() + ' logout!');
      Meteor.logout();
      Router.go('home');
    };
    if (Meteor.isCordova) {
      IonActionSheet.show({
        titleText: "确定要退出登录吗？",
        buttons: [
          { text: '确定' }
        ],
        destructiveText: false,
        cancelText: '取消',
        cancel: function() {
        },
        buttonClicked: function(index) {
          if (index === 0) {
            IonActionSheet.close(function(){
              doLogout();
            });
            return false;
          }
          return true;
        },
        destructiveButtonClicked: function() {
          return true;
        }
      });
    } else {
      doLogout();
    }
  }
});
