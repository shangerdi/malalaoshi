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
    return routeName;
  },
  findOptions: function() {
    var param = {find:{},options:{}};
    if (!Meteor.userId() || !Meteor.user() || !Meteor.user().role) {
      return null;
    }
    var role = Meteor.user().role;
    if (role==='teacher') {
      param.find["teacher.id"]=Meteor.userId();
    } else {
      param.find["student.id"]=Meteor.userId();
    }
    var tab = this.getTab(), now = new Date(), nowTime = now.getTime();
    if (tab==='coursesToconfirm') { // 查询待确认完成的课程
      var startTime = nowTime - ScheduleTable.timeToConfirm;
      param.find.endTime = {'$gte': startTime, '$lte': nowTime};
      param.find.state = ScheduleTable.attendanceStateDict["reserved"].value;
    } else if (tab==='coursesConfirmed') { // 查询确认后的课程
      param.find.endTime = {'$lte': nowTime};
      param.find.state = {'$in': [ScheduleTable.attendanceStateDict["attended"].value, ScheduleTable.attendanceStateDict["commented"].value]};
    } else if (tab==='coursesToattend') { // 还没去上课
      param.find.endTime = {'$gt': nowTime};
      param.find.state = ScheduleTable.attendanceStateDict["reserved"].value;
    } else if (tab==='coursesAttended') { // 上课时间已过去的
      param.find.endTime = {'$lte': nowTime};
    } else {
      return null;
    }
    param.options.limit = this.getLimit();
    return param;
  },
  getCourses: function() {
    var param = this.findOptions();
    return param?CourseAttendances.find(param.find, param.options):null;
  },
  subscriptions: function() {
    if (!Meteor.userId() || !Meteor.user() || !Meteor.user().role) {
      return null;
    }
    this.subscribe('courseAttendances', this.findOptions());
  },
  data: function() {
    var courses = this.getCourses();
    var resultCount = courses?courses.count():0;
    var hasMore = resultCount === this.getLimit();
    return {
      courses: courses,
      tab: this.getTab(),
      limit: this.getLimit(),
      hasMore: hasMore,
      nextPath: hasMore ? this.nextPath() : null
    };
  },
  action: function() {
    // console.log('action');
    // this.subscribe('courseAttendances', this.findOptions());
    if (this.ready()) {
      this.render();
    } else {
      this.render('loading');
    }
  },
  onAfterAction: function () {
    var courses = this.getCourses();
    if (!courses) return;
    var a = [], orderIds = [];
    courses.forEach(function (item) {
      if (!_.contains(a,item.teacher.id)) {
        a.push(item.teacher.id);
      }
      if (!_.contains(a,item.student.id)) {
        a.push(item.student.id);
      }
      if (item.detail && item.detail.orderId && !_.contains(orderIds,item.detail.orderId)) {
        orderIds.push(item.detail.orderId);
      }
      if (item.state == ScheduleTable.attendanceStateDict["commented"].value) {
        Meteor.subscribe("commentsByCourseAttendanceId", {'find':{'courseAttendanceId': item._id}});
      }
    });
    Meteor.subscribe('userAvatars', a);
    Meteor.subscribe('orders', {find:{_id:{$in:orderIds}}});
  }
});
