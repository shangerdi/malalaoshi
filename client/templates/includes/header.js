var oldMessageCount = 0;
Template.header.helpers({
  messageCount: function(){
    var cnt = Messages.find({userId: Meteor.userId(), read: {$ne: true}}).count();
    if (oldMessageCount!=cnt) {
      if (oldMessageCount<cnt) {
        // console.log("new "+(cnt-oldMessageCount)+" messages have come");
      }
      oldMessageCount = cnt;
      // console.log("message count is changed");
    }
    if (cnt > 999) {
      return "···";
    }
    return cnt;
  }
});
