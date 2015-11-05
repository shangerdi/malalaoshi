Template.proceedsSelectCard.helpers({
  //add you helpers here
  teacherBalance: function() {
    return TeacherBalance.findOne();
  }
});

Template.proceedsSelectCard.events({
  //add your events here
  'click .item-card': function() {
    localStorage.setItem('withdrawCard', JSON.stringify(this));
    IonNavBack();
  }

});

Template.proceedsSelectCard.onCreated(function() {
  //add your statement here
});

Template.proceedsSelectCard.onRendered(function() {
  //add your statement here
  $("[data-action=add-card-step1]").click(function(e) {
    Router.go('proceedsAddCardStep1');
  });
});

Template.proceedsSelectCard.onDestroyed(function() {
  //add your statement here
});

