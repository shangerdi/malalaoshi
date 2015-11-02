Template.proceedsPassword.helpers({
  //add you helpers here
  teacherBalance: function() {
    return TeacherBalance.findOne();
  }
});

Template.proceedsPassword.events({
  //add your events here
  'click [data-action=my-cards]': function() {
    var resetPassInfo = {};
    resetPassInfo.newPass = $("#withdrawPass").val();
    resetPassInfo.token = Session.get('resetPassToken');
    Meteor.call('resetWithdrawPass', resetPassInfo, function(error, result) {
      if (error) {
        IonPopup.alert({
          title: error.reason,
          okText: "确定"
        });
        return throwError(error.reason);
      }

      Session.set('resetPassToken', null);
      IonPopup.alert({
        title: "设置密码成功!",
        okText: "确定",
        onOk: function() {
          Router.go('proceedsMyCards');
        }
      });
    });
  }
});

Template.proceedsPassword.onCreated(function() {
  //add your statement here
  //IonKeyboard.show();
});

Template.proceedsPassword.onRendered(function() {
  //add your statement here
});

Template.proceedsPassword.onDestroyed(function() {
  //add your statement here
  //IonKeyboard.close();
});

