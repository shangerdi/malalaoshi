Template.proceedsAddCardStep2.helpers({
  //add you helpers here
  cardInfo: function() {
    return Session.get('cardInfo');
  }
});

Template.proceedsAddCardStep2.events({
  //add your events here
  'click [data-action=add-card-step3]': function() {
    var cardInfo = Session.get('cardInfo');
    cardInfo.cardPhoneNumber = $("#cardPhoneNumber").val();
    Session.set('cardInfo', cardInfo);

    Router.go('proceedsAddCardStep3');
  }
});

Template.proceedsAddCardStep2.onCreated(function() {
  //add your statement here
});

Template.proceedsAddCardStep2.onRendered(function() {
  //add your statement here
});

Template.proceedsAddCardStep2.onDestroyed(function() {
  //add your statement here
});

