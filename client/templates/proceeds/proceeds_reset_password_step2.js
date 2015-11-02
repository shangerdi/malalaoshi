Template.proceedsResetPasswordStep2.helpers({
  //add you helpers here
  getSelectCard: function() {
    var sessionCard = Session.get('selectCard');
    if (sessionCard) {
      return sessionCard;
    }
    var storedCard = getWithdrawCard();
    if (storedCard) {
      Session.set('selectCard', storedCard);
      return storedCard;
    }
    return null;
  },
  getTailNumber: function(cardNumber) {
    return cardNumber.slice(-4);
  }
});

Template.proceedsResetPasswordStep2.events({
  //add your events here
  'click [data-action=identity-verify]': function() {
    var params = {};
    params.cardUserName = $("#cardUserName").val();
    params.IDNumber = $("#IDNumber").val();
    params.cardNumber = $("#cardNumber").val();
    Meteor.call('identityVerify', params, function(error, result) {
      if (error) {
        IonPopup.alert({
          title: error.reason,
          okText: "确定"
        });
        return throwError(error.reason);
      }

      if (result && result.success) {
        Session.set('resetPassToken', result.token);
      }
      Router.go('proceedsPassword');
    });
  }
});

Template.proceedsResetPasswordStep2.onCreated(function() {
  //add your statement here
});

Template.proceedsResetPasswordStep2.onRendered(function() {
  //add your statement here
});

Template.proceedsResetPasswordStep2.onDestroyed(function() {
  //add your statement here
});

