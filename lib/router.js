Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound'
});

Router.route('/', { name: 'profile' });
Router.route('/settings/', { name: 'settings',
  waitOn: function() {
    return [
      Meteor.subscribe('areas')
    ];
  } });
Router.route('/register/', { name: 'register' });
Router.route('/login/', { name: 'mylogin' });
Router.route('/headImg/', { name: 'headImg' });
Router.route('/profiles', { name: 'profiles' });

var requireLogin = function() {
  if (! Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
      this.render('accessDenied');
    }
  } else {
    this.next();
  }
}

Router.onBeforeAction('dataNotFound', {only: ['profile', 'settings']});
Router.onBeforeAction(requireLogin, {only: ['profile', 'settings']});
