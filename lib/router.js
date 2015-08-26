Router.configure({
  layoutTemplate: function() {
    var ans = 'layout';
    var curRouteName = Router.current().route.getName();
    var onlyApp = isParent = Meteor.user() && Meteor.user().role === 'parent';
    var isTeacher = Meteor.user() && Meteor.user().role === 'teacher';
    if (Meteor.isCordova || onlyApp) {
      if (curRouteName==='home') {
        ans = 'directLayout';
      }
      else if (_.contains(['teachers', 'orders'], curRouteName)) {
        ans = 'appTabsLayout';
      }
      else if (isParent && _.contains(['scheduleCalendar', 'coursesUnconfirmed', 'coursesConfirmed'], curRouteName)) {
        ans = 'appScheduleStudentLayout';
      }
      else {
        ans = 'appLayout';
      }
    }
    if (isTeacher && _.contains(['scheduleCalendar', 'coursesTodo', 'coursesFinish'], curRouteName)) {
      ans = 'appScheduleTeacherLayout';
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

Router.route('/index', {name: 'index', layoutTemplate: null});
Router.route('/teachers/filter', {name: 'teachersFilter', layoutTemplate: 'appLayout',
  data: function(){
    return {
      setAddress: this.params.hash
    };
  }
});

Router.route('/', { name: 'home', template: function() {
  return Meteor.isCordova ? 'home' : 'dashboard';
}});
Router.route('/dashboard', { name: 'dashboard' });
//Router.route('/testmail', { name: 'testmail' });
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
Router.route('/schedule/weekly', {name: 'scheduleWeekly',
  waitOn:function() {
    if (Meteor.user()) {
      var address = Meteor.user().profile.address, code=[];
      if (address) {
        if (address.province && address.province.code) {
          code.push(address.province.code);
        }
        if (address.city && address.city.code) {
          code.push(address.city.code);
        }
        if (address.district && address.district.code) {
          code.push(address.district.code);
        }
      }
    } else {
      return;
    }
    return [
      Meteor.subscribe('teacherAvailableTime', Meteor.userId()),
      Meteor.subscribe('areaTimePhases', code)
    ];
  }
});
Router.route('/schedule/calendar', {name: 'scheduleCalendar'});
Router.route('/schedule/weekly/for/order/test/:teacherId', {name: 'scheduleWeeklyForOrderTest',
  waitOn:function() {
    if (!Meteor.userId()) {
      return null;
    }
    var teacherId = this.params.teacherId;
    if (!teacherId) {
      return null;
    }
    var attendanceQuery = {find:{"teacher.id":teacherId},options:{}};
    var now = new Date(), todayTime = new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime(), laterTime = todayTime+(7+ScheduleTable.tryDays)*ScheduleTable.MS_PER_DAY;
    attendanceQuery.find.attendTime = {$gte: todayTime, $lt: laterTime};
    return [
      Meteor.subscribe('teacherAvailableTime', teacherId),
      Meteor.subscribe('areaTimePhasesByTeacher', teacherId),
      Meteor.subscribe('courseAttendances', attendanceQuery)
    ];
  },
  data:function() {
    return {teacherId:this.params.teacherId};
  }
});
Router.route('/courses/unconfirmed/:limit?', {name: 'coursesUnconfirmed', template: 'studentScheduleCourses', controller: 'ScheduleCoursesController'});
Router.route('/courses/confirmed/:limit?', {name: 'coursesConfirmed', template: 'studentScheduleCourses', controller: 'ScheduleCoursesController'});
Router.route('/courses/todo/:limit?', {name: 'coursesTodo', template: 'teacherScheduleCourses', controller: 'ScheduleCoursesController'});
Router.route('/courses/finish/:limit?', {name: 'coursesFinish', template: 'teacherScheduleCourses', controller: 'ScheduleCoursesController'});

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

Router.route('/teachers/:teachersLimit?', {name: 'teachers', layoutTemplate: 'appLayout',
  controller: TeachersController
});

Router.route('/teacher/:id', {name: 'teacher',
  waitOn: function(){
    var attendanceQuery = {find:{"teacher.id":this.params.id},options:{}};
    var now = new Date(), todayTime = new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime(), laterTime = todayTime+(7+ScheduleTable.tryDays)*ScheduleTable.MS_PER_DAY;
    attendanceQuery.find.attendTime = {$gte: todayTime, $lt: laterTime};
    return [
      Meteor.subscribe('teacher', this.params.id),
      Meteor.subscribe('teacherAvailableTime', this.params.id),
      Meteor.subscribe('areaTimePhasesByTeacher', this.params.id),
      Meteor.subscribe('courseAttendances', attendanceQuery)
    ];
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

Router.route('/orders/:ordersLimit?', {name: 'orders',
  controller: OrdersController
});

Router.route('/order/:id?', {name: 'order'});

Router.route('/order/step/schedule/:teacherId?', {name: 'orderStepSchedule'});
Router.route('/order/:orderId?/step/confirm', {name: 'orderStepConfirm'});
Router.route('/order/:orderId/step/pay', {name: 'orderStepPay',
  waitOn: function() {
    var orderId = this.params.orderId;
    return Meteor.subscribe('order', {'orderId': orderId});
  }
});

Router.route('/parent/settings', {name: 'parentSettings'});
Router.route('/parent/settings/edit', {name: 'parentSettingsEdit'});

/*************************
 * Ping++ Urls
 *************************/

// ping++ pay: alipay_wap success url
Router.route('/pingpp/alipay_wap', {name: 'pingppResultUrl', action: function () {
  console.log("debug: /pingpp/alipay_wap")
  var req = this.request, res = this.response;
  var payResult = this.params.query.result;
  var orderNo = this.params.query.out_trade_no;
  console.log("order:"+orderNo+", pay result:"+payResult);
  var curRouter = this;
  if (orderNo) {
    // 检测订单状态：查询ping++ Charge对象，若返回支付成功，更新订单状态
    Meteor.call('updateOrderPayStatus', orderNo, function(error, result) {
      console.log('call updateOrderPayStatus:' + result);
      // redirect to order page
      // curRouter.redirect('order',{id:orderNo});
      curRouter.render("orderStepPaySuccess", {
        data: function() {
          return {'orderId': orderNo};
        }
      })
    });
  } else {
    curRouter.redirect('orders');
  }
  console.log("debug: /pingpp/alipay_wap. end")
}});


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

Router.route('/map', {name: 'map', layoutTemplate: 'appLayout'});


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
      this.redirect('mylogin');
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

Router.onBeforeAction('loading');
Router.onBeforeAction(requireLogin, {except: ['mylogin','home', 'about','jobs', 'rights','register','register0']});
Router.onBeforeAction(onLoggedIn, {only: ['mylogin','home','register','register0']});

Router.onBeforeAction(function(req, res, next) {
  req.bodyRawData = '';
  req.on('data', function(chunk){
    req.bodyRawData += chunk;
  });
  next();
}, {where: 'server', only:['pingppWebhooks']});
