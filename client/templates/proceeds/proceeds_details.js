Template.proceedsDetails.helpers({
  //add you helpers here
  transactionDetail: function() {
    return TransactionDetail.find({}, {sort: {createdAt:-1}});
  }
});

Template.proceedsDetails.events({
  //add your events here
});

Template.proceedsDetails.onCreated(function() {
  //add your statement here
});

Template.proceedsDetails.onRendered(function() {
  //add your statement here
});

Template.proceedsDetails.onDestroyed(function() {
  //add your statement here
});

