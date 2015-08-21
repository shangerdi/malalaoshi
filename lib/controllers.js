/* 管理员-审核老师界面 - controller */
AuditTeachersController = RouteController.extend({
  increment: 10,
  sort: {submitTime: 1},
  teachersLimit: function() { 
    return parseInt(this.params.teachersLimit) || this.increment; 
  },
  nextPath: function() {
    return this.route.path({teachersLimit: this.teachersLimit() + this.increment})
  },
  findOptions: function() {
    var state = Session.get("state");
    var param = {};
    if (!state) {
      param.find = {};
    } else if (state=='new') {
      param.find = {basicInfo:null,eduInfo:null,certInfo:null};
    } else if (state=='todo') {
      param.find = {$or: [{'basicInfo.status':'submited'},{'eduInfo.status':'submited'},{'certInfo.status':'submited'}]};
    } else if (state=='partOk') {
      param.find = {$and: [
        {$or: [{'basicInfo.status':{$exists: true, $ne: 'approved'}},{'eduInfo.status':{$exists: true, $ne: 'approved'}},{'certInfo.status':{$exists: true, $ne: 'approved'}}]},
        {$or: [{'basicInfo.status':'approved'},{'eduInfo.status':'approved'},{'certInfo.status':'approved'}]}
      ]};
    } else if (state=='allOk') {
      param.find = {'basicInfo.status':'approved','eduInfo.status':'approved','certInfo.status':'approved'};
    } else {
      param.find = {};
    }
    param.options = {sort: this.sort, limit: this.teachersLimit()};
    return param;
  },
  subscriptions: function() {
    this.teachersSubs = Meteor.subscribe('teacherAudits', this.findOptions());
  },
  teachers: function() {
    var param = this.findOptions();
    return TeacherAudit.find(param.find, param.options);
  },
  data: function() {
    var self = this;
    return {
      teachers: self.teachers(),
      ready: self.teachersSubs.ready,
      nextPath: function() {
        if (self.teachers().count() === self.teachersLimit())
          return self.nextPath();
      },
      totalCount: TeacherAudit.find().count(),
      unsubmitCount: TeacherAudit.find({basicInfo:null,eduInfo:null,certInfo:null}).count(),
      todoCount: TeacherAudit.find({$or: [{'basicInfo.status':'submited'},{'eduInfo.status':'submited'},{'certInfo.status':'submited'}]}).count(),
      approvedCount: TeacherAudit.find({'basicInfo.status':'approved','eduInfo.status':'approved','certInfo.status':'approved'}).count()
    };
  }
});

/* 约课-选择课时界面 - controller */
OrderStepScheduleController = RouteController.extend({
  getTeacherId: function() {
    return Session.get('orderTeacherId');
  },
  waitOn: function(){
    var teacherId = this.getTeacherId();
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
  data:function(){
    return {teacherId: this.getTeacherId()}
  }
});
OrderStepConfirmController = RouteController.extend({
  getTeacherId: function() {
    return Session.get('orderTeacherId');
  },
  waitOn: function(){
    var teacherId = this.getTeacherId();
    if (!teacherId) {
      return null;
    }
    return [
      Meteor.subscribe('teacher', teacherId)
    ];
  },
  data:function(){
    return {teacherId: this.getTeacherId()}
  }
});
