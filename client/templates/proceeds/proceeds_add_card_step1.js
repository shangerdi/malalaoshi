Template.proceedsAddCardStep1.helpers({
  //add you helpers here
});

Template.proceedsAddCardStep1.events({
  //add your events here
});

Template.proceedsAddCardStep1.onCreated(function() {
  //add your statement here
});

Template.proceedsAddCardStep1.onRendered(function() {
  //add your statement here
  $("[data-action=add-card-step2]").click(function(e) {
    var cardNumber = $("#cardNumber").val();
    if (!cardNumber) {
      alert('请输入卡号');
    }

    console.log("cardNumber: " + cardNumber);
    Meteor.call('getCardInfo', cardNumber, function(error, result) {
      console.log("getCardInfo: returned");
      if (error)
        return throwError(error.reason);

      console.log("getCardInfo: no errors");
      var cardInfo = result;
      console.log(cardInfo);
      console.log(cardInfo.cardNumber);
      console.log(cardInfo.bankName);
      console.log(cardInfo.cardType);
      if (cardInfo && cardInfo.cardNumber && cardInfo.bankName && cardInfo.cardType) {
        console.log("getCardInfo: cardInfo not null");
        IonPopup.show({
          title: '银行卡信息',
          template: '<li>' + cardInfo.cardNumber + '</li>'
          + '<li>' + cardInfo.bankName + '</li>'
          + '<li>' + cardInfo.cardType + '</li>',
          buttons: [{
            text: '知道了',
            type: 'button-positive',
            onTap: function() {
              IonPopup.close();
              Router.go('proceedsAddCardStep2');
            }
          }]
        });
      }
    });
  });
});

Template.proceedsAddCardStep1.onDestroyed(function() {
  //add your statement here
});

