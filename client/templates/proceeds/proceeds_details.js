Template.proceedsDetails.helpers({
  //add you helpers here
  transactionDetail: function() {
    return TransactionDetail.find({}, {sort: {createdAt:-1}});
  },
  transactionDetails: function() {
    var transactionDetails = [];
    TransactionDetail.find({}, {sort: {createdAt:-1}}).forEach(function(detail) {
      var dayStr = new moment(detail.createdAt).format('MM月DD日');
      if (transactionDetails.length === 0 || transactionDetails[transactionDetails.length-1].dayStr !== dayStr) {
        var detailsInOneDay = {};
        detailsInOneDay.dayStr = dayStr;
        detailsInOneDay.details = [];
        transactionDetails.push(detailsInOneDay);
      }
      transactionDetails[transactionDetails.length-1].details.push(detail);
    });
    return transactionDetails;
  },
  convTitle2IconUrl: function(title) {
    if (title && title.indexOf)
    {
      var iconList = [
        {titleContains: '收入', iconFile: 'income.png'},
        {titleContains: '佣金', iconFile: 'charges.png'},
        {titleContains: '提现', iconFile: 'withdraw.png'},
        {titleContains: '补助', iconFile: 'grants.png'}
      ];
      var src = '/images/proceeds/';
      for (var i = 0; i < iconList.length; i++) {
        var icon = iconList[i];
        if (title.indexOf(icon.titleContains) !== -1) {
          return src + icon.iconFile;
        }
      }
    }
    return "";
  },
  getDateTime: function(createdAt) {
    return (new moment(createdAt).format('HH:mm'));
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

