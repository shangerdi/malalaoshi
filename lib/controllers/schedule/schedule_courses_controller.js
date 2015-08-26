/* 我的课程 - 列表 - controller */
ScheduleCoursesController = RouteController.extend({
  increment: 5,
  getLimit: function() {
    return parseInt(this.params.limit) || this.increment;
  },
  nextPath: function() {
    return this.route.path({limit: this.getLimit() + this.increment})
  },
  getTab: function() {
    var routeName = this.route.getName();
    console.log(routeName);
    if ("coursesUnconfirmed"===routeName) {
      return "unconfirmed"
    } else if ("coursesConfirmed"===routeName) {
      return "confirmed";
    } else if ("coursesTodo"===routeName) {
      return "todo";
    } else if ("coursesFinish"===routeName) {
      return "finish";
    }
  },
  findOptions: function() {
    var param = {find:{},options:{}};
    if (!Meteor.userId() || !Meteor.user()) {
      return param;
    }
    var role = Meteor.user().role;
    if (role==='teacher') {
      param.find["teacher.id"]=Meteor.userId();
    } else {
      param.find["student.id"]=Meteor.userId();
    }
    var today = new Date();
    var startTime = today.getTime() - ScheduleTable.timeForRenew;
    param.find.attendTime = {'$gte': today.getTime()};
    param.find.state = ScheduleTable.attendanceStateDict["reserved"].value;
    param.options.limit = this.getLimit();
    return param;
  },
  subscriptions: function() {
    console.log("wait on ...");
    console.log(Meteor.user());
    if (!Meteor.userId() || !Meteor.user() || !Meteor.user().role) {
      return null;
    }
    this.subscribe('courseAttendances', this.findOptions());
  },
  data: function() {
    console.log("data ");
    console.log(Meteor.user());
    var param = this.findOptions();
    var resultCount = CourseAttendances.find(param.find, param.options).count();
    var hasMore = resultCount === this.getLimit();
    return {
      tab: this.getTab(),
      limit: this.getLimit(),
      hasMore: hasMore,
      nextPath: hasMore ? this.nextPath() : null
    };
  },
  action: function() {
    console.log('action');
    console.log(Meteor.user());
    // this.subscribe('courseAttendances', this.findOptions());
    if (this.ready()) {
      this.render();
    } else {
      this.render('loading');
    }
  }
});
