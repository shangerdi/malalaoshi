Template.header.helpers({
  activeRouteClass: function(/* route names */) {
    var args = Array.prototype.slice.call(arguments, 0);
    args.pop();

    var active = _.any(args, function(name) {
      return Router.current() && Router.current().route.getName() === name
    });

    return active && 'active';
  },
  sup: function() {
    var host = window.location.hostname;
    if (host.match('(localhost|127.0.0.1)')) {
      return 'Dev';
    }
    else if (host.match('stage\..*')) {
      return 'Stage';
    }
    return 'Beta';
  },
  isAdmin: function() {
    return Meteor.user() && Meteor.user().role === 'admin';
  }
});
