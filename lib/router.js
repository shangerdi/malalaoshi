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
Router.route('/profile/edit/cert', { name: 'profileEditCert',
  waitOn:function() {
    return [Meteor.subscribe('curUserCertification')];
  }
});
Router.route('/profile/edit/avatar', { name: 'profileEditAvatar'});

Router.route('/messages', { name: 'messages'});
Router.route('/about', { name: 'about'});
Router.route('/rights', { name: 'rights'});
Router.route('/feedback', { name: 'feedback'});
Router.route('/admin/feedbacks', { name: 'feedbacks',
  waitOn: function() {
    return [Meteor.subscribe('feedbacks')];
  }
});

Router.route('/register', { name: 'register' });
Router.route('/login', { name: 'mylogin' });
Router.route('/avatar', { name: 'avatar' });
Router.route('/audit/teachers', { name: 'teachers',
  waitOn: function() {
    return [Meteor.subscribe('userAudits', {})];
  }
});
Router.route('/audit/teacher/:_userId', {name: 'auditTeacher',
  waitOn: function() {
    return [Meteor.subscribe('auditOneTeacher', this.params._userId)];
  }
});
Router.route('/admin/users', { name: 'users',
  waitOn: function() {
    return [Meteor.subscribe('allusers')];
  }
});

var requireLogin = function() {
  if (! Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
      this.render('mylogin');
    }
  } else {
    this.next();
  }
}


Router.onBeforeAction('dataNotFound');
Router.onBeforeAction(requireLogin, {except: ['mylogin','home', 'about','jobs', 'rights','register']});
