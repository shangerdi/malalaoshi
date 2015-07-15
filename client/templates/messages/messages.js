Template.messages.helpers({
  messages: function() {
    return Messages.find({userId: Meteor.userId(), read: {$ne: true}}, {sort: {createTime: -1}});
  },
  messageCount: function(){
  	return Messages.find({userId: Meteor.userId(), read: {$ne: true}}).count();
  },
  viewedMessages: function() {
    return Messages.find({userId: Meteor.userId(), read: true}, {sort: {createTime: -1}});
  },
  viewedMessageCount: function() {
  	return Messages.find({userId: Meteor.userId(), read: true}).count();
  }
});

Template.messageItem.events({
  'click a': function() {
    Messages.update(this._id,{$set:{read:true}});
  }
});

Template.messages.events({
  'click a': function() {
    $('.viewed.message-list').toggle();
    $('.hist-message i.mala').toggleClass(function(){
      if ($(this).hasClass('mala-chevron-down')) {
        return 'mala-chevron-right';
      }
      else {
        return 'mala-chevron-down';
      }
    });
  }
});


