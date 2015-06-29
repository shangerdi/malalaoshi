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

Router.route('/about', { name: 'about', template: 'pageDetail',
  waitOn: function() {
    return [
      Meteor.subscribe('pages')
    ];
  },
  data: function() {
    var page = Pages.findOne({name: 'about'});
    if(!page){
      return new Object();
    }
    return page;
  }
});
Router.route('/rights', { name: 'rights', template: 'pageDetail',
  waitOn: function() {
    return [
      Meteor.subscribe('pages')
    ];
  },
  data: function() {
    var page = Pages.findOne({name: 'rights'});
    if(!page){
      return new Object();
    }
    return page;
  }
});
Router.route('/jobs', { name: 'jobs', template: 'pageDetail',
  waitOn: function() {
    return [
      Meteor.subscribe('pages')
    ];
  },
  data: function() {
    var page = Pages.findOne({name: 'jobs'});
    if(!page){
      return new Object();
    }
    return page;
  }
});
Router.route('/pages', { name: 'pages' });
Router.route('/page/edit/:_name', { name: 'pageEdit',
  waitOn: function() {
    return [
      Meteor.subscribe('pages')
    ];
  },
  data: function() {
    if(!this.params._name){
      return new Object();
    }
    var page = Pages.findOne({name: this.params._name});
    if(!page){
      var obj = new Object();
      obj.name = this.params._name;
      return obj;
    }
    return page;
  }
});
Router.route('/page/:_name', { name: 'pageDetail',
  waitOn: function() {
    return [
      Meteor.subscribe('pages')
    ];
  },
  data: function() {
    if(!this.params._name){
      return new Object();
    }
    var page = Pages.findOne({name: this.params._name});
    if(!page){
      var obj = new Object();
      obj.name = this.params._name;
      return obj;
    }
    return page;
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

Router.onBeforeAction('dataNotFound');
Router.onBeforeAction(requireLogin, {except: ['mylogin','home', 'about','jobs', 'rights','register']});
