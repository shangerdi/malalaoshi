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

Template.messageItem.helpers({
  'unread': function() {
    return (!this.read);
  },
  'createTimeStr': function() {
    var theTime = this.createTime;
    return moment(theTime).fromNow();
  }
});

Template.messageItem.events({
  'click a': function() {
    Messages.update(this._id,{$set:{read:true}});
  }
});

Template.viewedMessageItem.helpers({
  'createTimeStr': function() {
    var theTime = this.createTime;
    return moment(theTime).fromNow();
  }
});

Template.messages.events({
  'click a': function() {
    $('.viewed.message-list').toggle();
    $('.hist-message i.lnr').toggleClass(function(){
      if ($(this).hasClass('lnr-chevron-down')) {
        return 'lnr-chevron-right';
      }
      else {
        return 'lnr-chevron-down';
      }
    });
  }
});


