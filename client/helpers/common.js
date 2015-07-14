Template.registerHelper('created', function(){
  return moment(this.createdAt).fromNow();
});
Template.registerHelper('site', function(){
  return '非常老师';
});

Template.registerHelper('isCordova', function(){
  return Meteor.isCordova;
});
Template.registerHelper('activeRouteClass', function(/* route names */) {
  var args = Array.prototype.slice.call(arguments, 0);
  args.pop();

  var activeTab = _.any(args, function(name) {
    return Router.current() && Router.current().route.getName() === name
  });

  return activeTab && 'active';
});
