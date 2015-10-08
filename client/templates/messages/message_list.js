var getType = function() {
  var type = Router.current().params.type;
  if (!type) {
    type = Messages.Types[0];
  }
  return type;
}
Template.messageList.helpers({
  'messageList': function() {
    var type = getType();
    var userId = Meteor.userId();
    return Messages.find({userId: userId, type: type}, {sort: {createdAt: 1}});
  },
  'getIcon': function() {

  },
  'getTitle': function() {
    var type = getType();
    return Messages.getTitleByType(type);
  }
});
