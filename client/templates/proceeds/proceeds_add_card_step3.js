Template.proceedsAddCardStep3.helpers({
  //add you helpers here
  cardInfo: function() {
    return Session.get('cardInfo');
  }
});

Template.proceedsAddCardStep3.events({
  //add your events here
  'click [data-action=add-card]': function() {
    var cardInfo = Session.get('cardInfo');
    Meteor.call('addNewCard', cardInfo, function(error, result) {
      if (error) {
        IonPopup.alert({
          title: error.reason,
          okText: "确定"
        });
        return throwError(error.reason);
      }

      IonPopup.alert({
        title: "开通成功!",
        okText: "确定",
        onOk: function() {
          Session.set('cardInfo', null);
          //todo: back to 'my cards' or 'select card' (ugly)
          IonNavBack();
          IonNavBack();
          IonNavBack();
          //Router.go('proceedsIndex');
        }
      });
    });
  }
});

Template.proceedsAddCardStep3.onCreated(function() {
  //add your statement here
});

Template.proceedsAddCardStep3.onRendered(function() {
  //add your statement here
});

Template.proceedsAddCardStep3.onDestroyed(function() {
  //add your statement here
});

