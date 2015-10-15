// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.format = function(fmt) {
  var o = {
    "M+": this.getMonth() + 1,                 //月份
    "d+": this.getDate(),                    //日
    "h+": this.getHours(),                   //小时
    "m+": this.getMinutes(),                 //分
    "s+": this.getSeconds(),                 //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds()             //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

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
    return (new Date(createdAt)).format('mm:ss');
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

