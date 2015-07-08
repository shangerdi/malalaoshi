Router.configure({
  layoutTemplate: function() {
    return Meteor.isCordova ? 'appLayout' : 'layout';
  },
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

Router.route('/', { name: 'home' });
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

['about', 'rights', 'jobs'].forEach(function(name){
  Router.route('/' + name, { name: name, template: 'pageDetail',
    waitOn: function() {
      return [
        Meteor.subscribe('pages')
      ];
    },
    data: function() {
      var query = {name: name};
      return Pages.findOne(query) || query;
    }
  });
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
Router.route('/register0', { name: 'register0' });
Router.route('/login', { name: 'mylogin' });
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

TeachersController = RouteController.extend({
  increment: 31,
  teachersLimit: function() {
    return parseInt(this.params.teachersLimit) || this.increment;
  },
  find: function(){
    return {'status.basic': 'approved'};
  },
  findOptions: function() {
    var limit = Session.get("teachersLimit");
    if(!limit){
      limit = this.teachersLimit();
      Session.set("teachersLimit", limit);
    }
    return {sort: {createdAt: -1 }, limit: limit};
  },
  parameters: function(){
    return {
      find: this.find(),
      options: this.findOptions()
    }
  },
  waitOn: function() {
    var subject = Session.get("teachersSubject");
    var grade = Session.get("teachersGrade");
    var limit = Session.get("teachersLimit");

    var subscriptionTerms = this.parameters();

    if(subject){
      if(subject != "all"){
        subscriptionTerms.find = _.extend(subscriptionTerms.find, {"profile.subjects.subject": subject});
      }
    }
    if(grade){
      if(grade != "all"){
        subscriptionTerms.find = _.extend(subscriptionTerms.find, {"profile.subjects.grade": grade});
      }
    }
    if(limit){
      subscriptionTerms.options.limit = limit;
    }

    this.teachersSub = Meteor.subscribe('teachers', subscriptionTerms);
    return this.teachersSub;
  },
  teachers: function(parameters) {
    return Meteor.users.find(parameters.find, parameters.findOptions);
  },
  data: function() {
    var parameters = {
      find: this.find(),
      findOptions: this.findOptions()
    };
    var teachers = this.teachers(parameters);

    var hasMore = teachers.count() === this.teachersLimit();
    var nextPath = this.route.path({teachersLimit: this.teachersLimit() + this.increment});
    return {
      teachers: teachers,
      ready: this.teachersSub.ready,
      nextPath: hasMore ? nextPath : null,
      terms: this.parameters()
    };
  }
});

Router.route('/teachers/:teachersLimit?', {name: 'teachers',
  controller: TeachersController
});

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
var isLoggedIn = function() {
  if (Meteor.loggingIn()) {
    this.render(this.loadingTemplate);
  }
  if (Meteor.user()) {
    Iron.Location.stop();
    Iron.Location.start();
    console.log("user has logged in");
    if (Meteor.user().role=='parent') {
      this.redirect(Router.routes['teachers'].path());
    } else {
      this.redirect(Router.routes['dashboard'].path());
    }
  } else {
    this.next();
  }
}

Router.route("/(.*)", {
  name: "notFound"
});

Router.onBeforeAction('loading');
Router.onBeforeAction(requireLogin, {except: ['mylogin','home', 'about','jobs', 'rights','register','register0']});
Router.onBeforeAction(isLoggedIn, {only: ['mylogin','home','register','register0']});
