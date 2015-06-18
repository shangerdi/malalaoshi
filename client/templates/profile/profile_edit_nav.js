Template.profileEditNav.helpers({
  activeRouteClass: function(/* route names */) {
    var args = Array.prototype.slice.call(arguments, 0);
    args.pop();

    var activeTab = _.any(args, function(name) {
      return Router.current() && Router.current().route.getName() === name
    });

    return activeTab && 'active-tab';
  }
});
