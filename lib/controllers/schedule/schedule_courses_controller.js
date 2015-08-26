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
  subscriptions: function() {
    if (!Meteor.userId() || !Meteor.user() || !Meteor.user().role) {
      return null;
    }
    this.subscribe('courseAttendances', this.findOptions());
  },
  data: function() {
    var param = this.findOptions();
    // console.log(param);
    var resultCount = param?CourseAttendances.find(param.find, param.options).count():0;
    var hasMore = resultCount === this.getLimit();
    return {
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
  }
});
