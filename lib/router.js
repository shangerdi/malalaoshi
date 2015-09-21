Router.configure({
  layoutTemplate: function() {
    var ans = 'layout';
    var onlyApp = Meteor.user() && Meteor.user().role === 'parent';
    if (Meteor.isCordova || onlyApp) {
      var curRouteName = Router.current().route.getName();
      if (curRouteName==='home' || curRouteName==='accountRole') {
        ans = 'directLayout';
      }
      else if (_.contains(['teachers', 'orders'], curRouteName)) {
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

Router.route('/index', {name: 'index', layoutTemplate: null});
Router.route('/teachers/filter', {name: 'teachersFilter', layoutTemplate: 'appLayout'});
Router.route('/comment/:cid', {name: 'comment', layoutTemplate: 'appLayout'});
Router.route('/teacher/:tid/comments', {name: 'comments', layoutTemplate: 'appLayout'});
Router.route('/commented/:cid', {name: 'commented', layoutTemplate: 'appLayout'});

Router.route('/courses/:cid/raffle', {name: 'raffle', layoutTemplate: 'appLayout'});

Router.route('/', { name: 'home', template: function() {
  // return Meteor.isCordova ? 'accountRole' : 'dashboard';
  return 'accountRole';
}});
Router.route('/account/role', { name: 'accountRole' });
Router.route('/account/entry', { name: 'accountEntry' });
Router.route('/register', { name: 'register' });
Router.route('/login', { name: 'mylogin' });
Router.route('/dashboard', { name: 'dashboard' });
//Router.route('/testmail', { name: 'testmail' });
Router.route('/application/progress', {name: 'applicationProgress'});
Router.route('/application/info', {name: 'applicationInfo'});
Router.route('/profile/edit/basic', { name: 'profileEditBasic',
  data: function() {
    return {user: Meteor.user()};
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

Router.route('/mine/profile', { name: 'mineProfile', template: function() {
    var role = Meteor.user().role;
    if (role==='teacher') {
      return 'mineProfile';
    } else {
      return 'mineProfileParent';
    }
  }
});
Router.route('/mine/profile/school', { name: 'mineProfileSchool'});
Router.route('/mine/profile/grade', { name: 'mineProfileGrade'});
Router.route('/mine/profile/avatar', { name: 'mineProfileAvatar'});
Router.route('/mine/profile/name', { name: 'mineProfileName'});
Router.route('/mine/profile/gender', { name: 'mineProfileGender'});
Router.route('/mine/profile/birthday', { name: 'mineProfileBirthday'});
Router.route('/mine/profile/degree', { name: 'mineProfileDegree'});
Router.route('/mine/profile/college', { name: 'mineProfileCollege'});
Router.route('/mine/profile/subjects', { name: 'mineProfileSubjects'});
Router.route('/mine/profile/teachingAge', { name: 'mineProfileTeachingAge'});
Router.route('/mine/profile/cert', { name: 'mineProfileCert'});
Router.route('/mine/profile/cert/:certType/upload', { name: 'mineProfileCertUpload'});
Router.route('/mine/profile/company', { name: 'mineProfileCompany'});
Router.route('/mine/profile/studyCenter', { name: 'mineProfileStudyCenter'});
Router.route('/mine/profile/selfIntro', { name: 'mineProfileSelfIntro'});
Router.route('/mine/profile/experiences', { name: 'mineProfileExperiences'});
Router.route('/mine/profile/experience/:id?', { name: 'mineProfileExperience'});
Router.route('/mine/profile/eduResults', { name: 'mineProfileEduResults'});
Router.route('/mine/profile/eduResult/:id?', { name: 'mineProfileEduResult'});
Router.route('/mine/profile/photos', { name: 'mineProfilePhotos'});
Router.route('/mine/profile/service/area', { name: 'mineProfileServiceArea'});
Router.route('/mine/profile/service/area/list', { name: 'mineProfileServiceAreaList'});
Router.route('/system/settings', { name: 'systemSettings'});

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
Router.route('/courses/toconfirm/:limit?', {name: 'coursesToconfirm', template: 'studentScheduleCourses', controller: 'ScheduleCoursesController'});
Router.route('/courses/confirmed/:limit?', {name: 'coursesConfirmed', template: 'studentScheduleCourses', controller: 'ScheduleCoursesController'});
Router.route('/courses/toattend/:limit?', {name: 'coursesToattend', template: 'teacherScheduleCourses', controller: 'ScheduleCoursesController'});
Router.route('/courses/attended/:limit?', {name: 'coursesAttended', template: 'teacherScheduleCourses', controller: 'ScheduleCoursesController'});

Router.route('/messages', { name: 'messages'});

['about', 'rights', 'jobs', 'agreement'].forEach(function(name){
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

Router.route('/teachers/:teachersLimit?', {name: 'teachers', layoutTemplate: 'appLayout',
  controller: TeachersController
});

Router.route('/teacher/:id', {name: 'teacher', layoutTemplate: 'appLayout'});

Router.route('/orders/:ordersLimit?', {name: 'orders',
  controller: OrdersController
});

Router.route('/order/:id?', {name: 'order'});

Router.route('/order/step/schedule/:teacherId?', {name: 'orderStepSchedule'});
Router.route('/order/:orderId?/step/confirm', {name: 'orderStepConfirm', template: 'order', controller: 'OrderController'});
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
    return {user: user};
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
    this.redirect('index');
  } else {
    this.next();
  }
}

var checkProgress = function() {
  if (Meteor.user() && Meteor.user().role === 'teacher') {
    var curRouteName = Router.current().route.getName();
    if (curRouteName!=='applicationProgress') {
      var auditObj = TeacherAudit.findOne({'userId': Meteor.userId()});
      if (!auditObj || auditObj.applyStatus!='started') {
        this.redirect('applicationProgress');
        return;
      }
    }
  }
  this.next();
}

Router.onBeforeAction('loading');
Router.onBeforeAction(requireLogin, {except: ['home', 'about','jobs', 'rights','agreement', 'mylogin','register','accountRole','accountEntry']});
Router.onBeforeAction(onLoggedIn, {only: ['home','mylogin','register','accountRole','accountEntry']});
Router.onBeforeAction(checkProgress);

Router.onBeforeAction(function(req, res, next) {
  req.bodyRawData = '';
  req.on('data', function(chunk){
    req.bodyRawData += chunk;
  });
  next();
}, {where: 'server', only:['pingppWebhooks']});
