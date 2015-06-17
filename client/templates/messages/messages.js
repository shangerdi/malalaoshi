Meteor.subscribe('messages');
Template.messages.helpers({
  messages: function() {
    return Messages.find({userId: Meteor.userId(), read: {$ne: true}}, {sort: {createTime: -1}});
  },
  messageCount: function(){
  	return Messages.find({userId: Meteor.userId(), read: {$ne: true}}).count();
  }
});

Template.messageItem.helpers({
  'unread': function() {
    return (!this.read);
  },
  'createTimeStr': function() {
    var theTime = this.createTime;
    if (!theTime) {
      return "";
    }
    var now = new Date(),
      nowTime = now.getTime(),
      s = new Date(theTime),
      diffValue = nowTime - theTime,
      minute = 1000 * 60,
      hour = minute * 60,
      day = hour * 24,
      month = day * 30,
      year = month * 12;

    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(),
      yesterDay = today - day,
      beforeYesterDay = yesterDay - day;

    if (diffValue < minute) {
      return "刚刚";
    }
    if (diffValue < hour) {
      return parseInt(diffValue / minute) + "分钟前";
    }
    if (theTime >= today) { //"今天"
      return (s.getHours() < 12 ? "上午" : "下午") + s.getHours() + ":" + s.getMinutes();
    }
    if (theTime >= yesterDay) {
      return "昨天" + s.getHours() + ":" + s.getMinutes();
    }
    if (theTime >= beforeYesterDay) {
      return "前天" + s.getHours() + ":" + s.getMinutes();
    }
    if (diffValue < year) {
      var theYearTime = new Date(now.getFullYear()).getTime();
      if (theTime >= theYearTime) {
        return (s.getMonth() + 1) + "月" + s.getDate() + "日";
      }
    }
    return s.getFullYear() + "年" + (s.getMonth() + 1) + "月" + s.getDate() + "日";
  }
});

Template.messageItem.events({
  'click a': function() {
    Messages.update(this._id,{$set:{read:true}});
  }
});
