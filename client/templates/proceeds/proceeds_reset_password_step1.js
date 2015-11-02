Template.proceedsResetPasswordStep1.helpers({
  //add you helpers here
  teacherBalance: function() {
    return TeacherBalance.findOne();
  },
  getSelectCard: function() {
    var sessionCard = Session.get('selectCard');
    if (sessionCard) {
      var isSessionCardValid = false;
      var teacherBalance = TeacherBalance.findOne();
      teacherBalance.bankCards.forEach(function(card) {
        if (card.cardNumber == sessionCard.cardNumber) {
          isSessionCardValid = true;
          return false;
        }
      });
      if (isSessionCardValid) {
        return sessionCard;
      }
    }
    var storedCard = getWithdrawCard();
    if (storedCard) {
      Session.set('selectCard', storedCard);
      return storedCard;
    }
    return null;
  }
});

Template.proceedsResetPasswordStep1.events({
  //add your events here
  'click [data-action=reset-password-step2]': function() {
    Router.go('proceedsResetPasswordStep2');
  },
  'click .item-card': function() {
    Session.set('selectCard', this);
  }
});

Template.proceedsResetPasswordStep1.onCreated(function() {
  //add your statement here
});

Template.proceedsResetPasswordStep1.onRendered(function() {
  //add your statement here
});

Template.proceedsResetPasswordStep1.onDestroyed(function() {
  //add your statement here
});

