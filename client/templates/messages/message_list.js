var getType = function() {
  var type = Router.current().params.type;
  if (!type) {
    type = Messages.Types[0];
  }
  return type;
}
var setMessagesRead = function() {
  var maxHeight = $(window).height() - 40;
  $(".message-body").each(function(){
    var $this = $(this);
    if ($this.attr("read")) {
      return true;
    }
    var top = $this.offset().top;
    if (top < 0 || top >= maxHeight) {
      return true;
    }
    var msgId = $this.attr('msgid');
    if (!msgId) return;
    setTimeout(function(){
      var top = $("#"+msgId).offset().top;
      if (top >= maxHeight) {
        return;
      }
      Messages.update(msgId,{$set:{read:true}});
    }, 887);
  });
}
Template.messageList.helpers({
  'messageList': function() {
    var type = getType();
    var userId = Meteor.userId();
    return Messages.find({userId: userId, type: type}, {sort: {createdAt: 1}});
  },
  'getIcon': function() {
    var type = getType();
    return '/images/message/'+type+'.png';
  },
  'getTitle': function() {
    var type = getType();
    return Messages.getTitleByType(type);
  }
});
Template.messageList.onRendered(function(){
  var isIonic = $(".ionic-body")[0];
  // go to first unread message
  var firstUnread = $(".message-body .status-unread")[0];
  var toMsgId = null;
  if (firstUnread) {
    toMsgId = $(firstUnread).closest('.message-item')[0].id;
  } else {
    toMsgId = $('.message-item').last()[0].id;
  }
  if (isIonic) {
    $(".message-list-view .content").scrollTo('#'+toMsgId);
  } else {
    $(document.body).scrollTo('#'+toMsgId);
  }
  setMessagesRead();
  $(document.body).scroll(function(e) {
    setMessagesRead();
  });
  $(".message-list-view .content").scroll(function(e) {
    setMessagesRead();
  });
});
