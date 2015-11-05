Template.templateBankCards.helpers({
  //add you helpers here
  teacherBalance: function() {
    return TeacherBalance.findOne();
  }
});

Template.templateBankCards.events({
  //add your events here
});

Template.templateBankCards.onCreated(function() {
  //add your statement here
});

Template.templateBankCards.onRendered(function() {
  //add your statement here
});

Template.templateBankCards.onDestroyed(function() {
  //add your statement here
});

