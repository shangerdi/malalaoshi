Template.proceedsAddCardStep1.helpers({
  //add you helpers here
  cardInfo: function() {
    return Session.get('cardInfo');
  }
});

Template.proceedsAddCardStep1.events({
  //add your events here
  'click [data-action=add-card-step2]': function() {
    var cardNumber = $("#cardNumber").val();
    if (!cardNumber) {
      IonPopup.alert({
        title: "请输入卡号",
        okText: "确定"
      });
      return;
    }

    Meteor.call('getCardInfo', cardNumber, function(error, result) {
      if (error) {
        IonPopup.alert({
          title: error.reason,
          okText: "确定"
        });
        return throwError(error.reason);
      }

      var cardInfo = result;
      if (cardInfo && cardInfo.cardNumber) {
        var cardUserName = $("#cardUserName").val();
        cardInfo.cardUserName = cardUserName;
        Session.set('cardInfo', cardInfo);
        Router.go('proceedsAddCardStep2');
      }
    });
  }
});

Template.proceedsAddCardStep1.onCreated(function() {
  //add your statement here
});

Template.proceedsAddCardStep1.onRendered(function() {
  //add your statement here
});

Template.proceedsAddCardStep1.onDestroyed(function() {
  //add your statement here
});

