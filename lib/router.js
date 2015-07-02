Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function() {
    return [
      Meteor.subscribe('messages'),
      Meteor.subscribe('userData'),
      Meteor.subscribe('teacherAudits')
    ]
  }
});

Router.route('/', { layoutTemplate: 'homeLayout', name: 'home' });
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

Router.route('/about', { name: 'about', template: 'pageDetail',
  waitOn: function() {
    return [
      Meteor.subscribe('pages')
    ];
  },
  data: function() {
    var query = {name: 'about'};
    return Pages.findOne(query) || query;
  }
});
Router.route('/rights', { name: 'rights', template: 'pageDetail',
  waitOn: function() {
    return [
      Meteor.subscribe('pages')
    ];
  },
  data: function() {
      var query = {name: 'rights'};
      return Pages.findOne(query) || query;
  }
});
Router.route('/jobs', { name: 'jobs', template: 'pageDetail',
  waitOn: function() {
    return [
      Meteor.subscribe('pages')
    ];
  },
  data: function() {
    var query = {name: 'jobs'};
    return Pages.findOne(query) || query;
  }
});
Router.route('/pages', { name: 'pages' });
Router.route('/page/edit/:name', { name: 'pageEdit',
  waitOn: function() {
    return [
      Meteor.subscribe('pages')
    ];
  },
  data: function() {
    if(!this.params.name){
      return new Object();
    }

    var query = {name: this.params.name};
    return Pages.findOne(query) || query;
  }
});

Router.route('/feedback', { name: 'feedback'});
Router.route('/admin/feedbacks', { name: 'feedbacks',
  waitOn: function() {
    return [Meteor.subscribe('feedbacks')];
  }
});

Router.route('/register', { name: 'register' });
Router.route('/login', { name: 'mylogin' });
Router.route('/avatar', { name: 'avatar' });
Router.route('/audit/teachers', { name: 'auditTeachers',
  waitOn: function() {
    return [Meteor.subscribe('teacherAudits', {})];
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

Router.route('/user/:_id/edit', { name: 'userEdit',
  waitOn: function() {
    return [Meteor.subscribe('allusers')];
  },
  data: function() {
    if(!this.params._id){
      return new Object();
    }
    var user = Meteor.users.findOne({_id: this.params._id});
    if(!user){
      return new Object();
    }
    return user;
  }
});

Router.route('/teachers', {name: 'teachers'});

Router.route('/orders', {name: 'orders'});



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

Router.route("/(.*)", {
  name: "notFound"
});

Router.onBeforeAction('loading');
Router.onBeforeAction(requireLogin, {except: ['mylogin','home', 'about','jobs', 'rights','register']});
