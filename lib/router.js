Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound'
});

Router.route('/', "dashboard", { name: 'home' });
Router.route('/dashboard', { name: 'dashboard' });
Router.route('/profile', { name: 'profile'});
Router.route('/profile/edit', { name: 'profileForm',
  waitOn: function() {
    return [
      Meteor.subscribe('areas')
    ];
  }
});

Router.route('/messages', { name: 'messages'});
Router.route('/about', { name: 'about'});
Router.route('/rights', { name: 'rights'});
Router.route('/feedback', { name: 'feedback'});

Router.route('/register', { name: 'register' });
Router.route('/login', { name: 'mylogin' });
Router.route('/avatar', { name: 'avatar' });
Router.route('/teachers', { name: 'teachers' });

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

Router.onBeforeAction('dataNotFound', {only: ['dashboard', 'profile', 'profile-form', 'teachers']});
Router.onBeforeAction(requireLogin, {only: ['dashboard', 'profile', 'profile-form', 'teachers']});
