var timeTick = new Tracker.Dependency();
Meteor.setInterval(function () {
    timeTick.changed();
}, 20000);
fromNowReactive = function (mmt) {
  timeTick.depend();
  return mmt.fromNow();
}
Template.registerHelper('created', function(){
  return fromNowReactive(moment(this.createdAt));
});
Template.registerHelper('site', function(){
  return SITE_NAME;
});

Template.registerHelper('isCordova', function(){
  return Meteor.isCordova;
});
Template.registerHelper('platform', function(){
  if (Meteor.isCordova) {
    return 'cordova';
  }
  return 'browser';
});
Template.registerHelper('activeRouteClass', function(/* route names */) {
  var args = Array.prototype.slice.call(arguments, 0);
  args.pop();

  var activeTab = _.any(args, function(name) {
    return Router.current() && Router.current().route.getName() === name
  });

  return activeTab && 'active';
});
