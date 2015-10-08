Template.messageMain.helpers({
  'messageTypeList': function() {
    var userId = Meteor.userId();
    var total = Messages.find({userId: userId}).count();
    if (total===0) {
      return null;
    }
    var a = [];
    _.each(Messages.Types, function(type) {
      var obj = Messages.findOne({userId: userId, type: type}, {sort: {created: -1}});
      if (!obj) {
        return;
      }
      var unreadCount = Messages.find({userId: userId, type: type, read: {$ne: true}}).count();
      obj.unreadCount = unreadCount;
      a.push(obj);
    });
    return a;
  },
  'getMessgeIcon': function(type) {

  },
  'getMessageTitle': function(type) {
    return Messages.getTitleByType(type);
  }
});
