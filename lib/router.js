Router.configure({
  layoutTemplate: function() {
    var ans = 'layout';
    if (Meteor.isCordova) {
      var curRouteName = Router.current().route.getName();
      if (curRouteName==='home') {
        return 'directLayout';
      }
      if (_.contains(['teachers', 'orders'], curRouteName)) {
        ans = 'appTabsLayout';
      }
      else {
        ans = 'appLayout';
      }
    }
    return ans;
  },
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function() {
    return [
      Meteor.subscribe('messages'),
      Meteor.subscribe('userData')
    ]
  },
  trackPageView: true
});

Router.route('/', { name: 'home', template: function() {
  return Meteor.isCordova ? 'home' : 'dashboard';
}});
Router.route('/dashboard', { name: 'dashboard' });
Router.route('/testmail', { name: 'testmail' });
Router.route('/profile/edit/basic', { name: 'profileEditBasic'});
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

Router.route('/feedback', { name: 'feedback'});
Router.route('/register', { name: 'register' });
Router.route('/register0', { name: 'register0' });
Router.route('/login', { name: 'mylogin' });

TeachersController = RouteController.extend({
  increment: 200,
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

Router.route('/teacher/:id', {name: 'teacher',
  waitOn: function(){
    return Meteor.subscribe('teacher', this.params.id);
  },
  data: function(){
    var id = this.params.id;
    var user = Meteor.users.findOne({"_id": id});
    var userEdu = UserEducation.findOne({'userId': id});
    return {
      user: user,
      userEdu: userEdu
    }
  }
});

OrdersController = RouteController.extend({
  increment: 200,
  ordersLimit: function() {
    return parseInt(this.params.ordersLimit) || this.increment;
  },
  find: function(){
    if(Meteor.user()){
      return {"status": {$ne: "deleted"}, "student.id": Meteor.user()._id};
    }else{
      return {_id: "0"};
    }
  },
  findOptions: function() {
    var limit = Session.get("ordersLimit");
    if(!limit){
      limit = this.ordersLimit();
      Session.set("ordersLimit", limit);
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
    var limit = Session.get("ordersLimit");

    var subscriptionTerms = this.parameters();

    if(limit){
      subscriptionTerms.options.limit = limit;
    }

    this.ordersSub = Meteor.subscribe('orders', subscriptionTerms);
    return this.ordersSub;
  },
  orders: function(parameters) {
    return Orders.find(parameters.find, parameters.findOptions);
  },
  data: function() {
    var parameters = {
      find: this.find(),
      findOptions: this.findOptions()
    };
    var orders = this.orders(parameters);

    var hasMore = orders.count() === this.ordersLimit();
    var nextPath = this.route.path({teachersLimit: this.ordersLimit() + this.increment});
    return {
      orders: orders,
      ready: this.ordersSub.ready,
      nextPath: hasMore ? nextPath : null,
      terms: this.parameters()
    };
  }
});

Router.route('/orders/:ordersLimit?', {name: 'orders',
  controller: OrdersController
});

Router.route('/order/:id?', {name: 'order',
  waitOn: function() {
    var orderId = this.params.id;
    var userId = this.params.query.userId;
    var teacherId = this.params.query.teacherId;
    var parameters = {
      userIds: [userId, teacherId],
      orderId: orderId
    };

    this.orderSub = Meteor.subscribe('order', parameters);
    return this.orderSub;
  },
  data: function(){
    if(this.ready()){
      var orderId = this.params.id;
      var order = null, student = null, teacher = null;
      if(orderId){
        order = Orders.findOne({"_id": orderId});
        if(order){
          if(order.student && order.student.id){
            student = Meteor.users.findOne({"_id": order.student.id});
          }
          if(order.teacher && order.teacher.id){
            teacher = Meteor.users.findOne({"_id": order.teacher.id});
          }
        }
      }else{
        var studentId = this.params.query.userId;
        var teacherId = this.params.query.teacherId;
        var className = this.params.query.className;
        var hour = this.params.query.hour;
        var unitCost = this.params.query.unitCost;
        var cost = this.params.query.cost;
        student = Meteor.users.findOne({"_id": studentId});
        teacher = Meteor.users.findOne({"_id": teacherId});

        var school = "", subject = "";
        if(teacher.profile && teacher.profile.subjects){
          var subjects = teacher.profile.subjects[0];
          if(subjects){
            if(subjects.subject){
              subject = getEduSubjectText(subjects.subject);
            }
            if(subjects.school){
              school = getEduSchoolText(subjects.school);
            }
          }
        }

        order = {
          student: {
            id: studentId,
            phoneNo: student.phoneNo,
            name: student.profile.name
          },
          teacher: {
            id: teacherId,
            name: teacher.profile.name
          },
          className: className,
          hour: hour,
          unitCost: unitCost,
          cost: cost,
          subject: school + subject,
          status: "submited"
        };
      }

      return {
        student: student,
        teacher: teacher,
        order: order
      }
    }
  }
});

Router.route('/parent/dashboard', {name: 'parentDashboard'});
Router.route('/parent/settings', {name: 'parentSettings'});
Router.route('/parent/settings/edit', {name: 'parentSettingsEdit'});

/*************************
 * Ping++ Urls
 *************************/

// ping++ pay: alipay_wap success url
Router.route('/pingpp/alipay_wap', function () {
  console.log("debug: /pingpp/alipay_wap")
  var req = this.request, res = this.response;
  var payResult = this.params.query.result;
  var orderNo = this.params.query.out_trade_no;
  console.log("order:"+orderNo+", pay result:"+payResult);
  if (orderNo) {
    var curRouter = this;
    // 检测订单状态：查询ping++ Charge对象，若返回支付成功，更新订单状态
    Meteor.call('updateOrderPayStatus', orderNo, function(error, result) {
      console.log('call updateOrderPayStatus:' + result);
      // redirect to order page
      curRouter.redirect('order',{id:orderNo});
    });
  }
  console.log("debug: /pingpp/alipay_wap. end")
});


/********************
** Admin Urls
********************/
Router.route('/admin/pages', { name: 'adminPages' });
Router.route('/admin/page/:name', { name: 'adminPage',
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

Router.route('/admin/feedbacks', { name: 'adminFeedbacks',
  waitOn: function() {
    return [Meteor.subscribe('feedbacks')];
  }
});
Router.route('/audit/teachers/:teachersLimit?', { name: 'auditTeachers'});
Router.route('/audit/teacher/:userId', {name: 'auditTeacher',
  waitOn: function() {
    return [Meteor.subscribe('auditOneTeacher', this.params.userId)];
  }
});

Router.route('/admin/orders', { name: 'adminOrders',
  waitOn: function() {
    return [Meteor.subscribe('allorders')];
  }
});

Router.route('/admin/users', { name: 'adminUsers',
  waitOn: function() {
    return [Meteor.subscribe('allusers')];
  }
});

Router.route('/admin/user/:_id', { name: 'adminUser',
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

Router.route("/(.*)", {
  name: "notFound"
});

var requireLogin = function() {
  if (!Meteor.isClient) {
    this.next();
    return;
  }
  if (! Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render('loading');
    } else {
      this.render('mylogin');
    }
  } else {
    this.next();
  }
}

var onLoggedIn = function() {
  if (Meteor.loggingIn()) {
    this.render('loading');
  }
  if (Meteor.user()) {
    if (Meteor.user().role=='parent') {
      this.redirect('teachers');
    } else {
      this.redirect('dashboard');
    }
  } else {
    this.next();
  }
}

var dashboardRedirect = function() {
  if (Meteor.user()) {
    var curRouteName = this.route.getName();
    if (curRouteName=='parentDashboard') {
      if (Meteor.user().role=='parent') {
        this.next();
      } else {
        this.redirect('dashboard');
      }
    } else if (curRouteName=='dashboard'){
      if (Meteor.user().role!='parent') {
        this.next();
      } else {
        this.redirect('parentDashboard');
      }
    }
  } else {
    this.next();
  }
}

Router.onBeforeAction('loading');
Router.onBeforeAction(requireLogin, {except: ['mylogin','home', 'about','jobs', 'rights','register','register0']});
Router.onBeforeAction(onLoggedIn, {only: ['mylogin','home','register','register0']});
Router.onBeforeAction(dashboardRedirect, {only: ['dashboard','parentDashboard']});

Router.onBeforeAction(function(req, res, next) {
  req.bodyRawData = '';
  req.on('data', function(chunk){
    req.bodyRawData += chunk;
  });
  next();
}, {where: 'server', only:['pingppWebhooks']});
