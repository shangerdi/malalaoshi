Template.proceedsDetails.helpers({
  //add you helpers here
  transactionDetail: function() {
    return TransactionDetail.find({}, {sort: {createdAt:-1}});
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

