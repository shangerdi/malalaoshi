Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound'
});

Router.route('/', "dashboard", { name: 'home' });
Router.route('/dashboard', { name: 'dashboard' });
Router.route('/profile', { name: 'profile'});
Router.route('/profile/edit/basic', { name: 'profileEditBasic',
  waitOn: function() {
    return [
      Meteor.subscribe('areas')
    ];
  }
});
Router.route('/profile/edit/edu', { name: 'profileEditEdu',
  waitOn:function() {
    return [Meteor.subscribe('curUserEducation')];
  }
});
Router.route('/profile/edit/cert', { name: 'profileEditCert'});
Router.route('/profile/edit/avatar', { name: 'profileEditAvatar'});

Router.route('/messages', { name: 'messages'});
Router.route('/about', { name: 'about'});
Router.route('/rights', { name: 'rights'});
Router.route('/feedback', { name: 'feedback'});
Router.route('/feedbacks', { name: 'feedbacks',
  waitOn: function() {
    return [Meteor.subscribe('feedbacks')];
  }
}); // for admin

Router.route('/register', { name: 'register' });
Router.route('/login', { name: 'mylogin' });
Router.route('/avatar', { name: 'avatar' });
Router.route('/teachers', { name: 'teachers' }); // for admin

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
Router.onBeforeAction(requireLogin, {only: ['dashboard', 'profile', 'profile-form', 'teachers', 'feedback', 'feedbacks']});
