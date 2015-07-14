Template.header.helpers({
  sup: function() {
    var host = window.location.hostname;
    if (host.match('(localhost|127\.0\.0\.1|.*\.local)')) {
      return 'Dev';
    }
    else if (host.match('stage\..*')) {
      return 'Stage';
    }
    return 'Beta';
  },
  messageCount: function(){
    var cnt = Messages.find({userId: Meteor.userId(), read: {$ne: true}}).count();
    if (cnt > 999) {
      return "···";
    }
    return cnt;
  }
});
