Template.messages.helpers({
  messages: function() {
    return Messages.find({userId: Meteor.userId()});
  },
  messageCount: function(){
  	return Messages.find({userId: Meteor.userId()}).count();
  }
});

Template.messageItem.events({
  'click a': function() {
    Messages.remove(this._id);
  }
})