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

/* 我的课程-年历视图 - controller */
ScheduleYearController = RouteController.extend({
  getYear: function() {
    var year = parseInt(this.params.year);
    if (isNaN(year) || !year || year < 1970) {
      year = new Date().getFullYear();
    }
    return year;
  },
  findOptions: function() {
    var param = {find:{},options:{}};
    if (!Meteor.userId()) {
      return param;
    }
    var role = Meteor.user().role;
    if (role==='teacher') {
      param.find["teacher.id"]=Meteor.userId();
    } else {
      param.find["student.id"]=Meteor.userId();
    }
    var year = this.getYear();
    var startTime = new Date(year, 0, 1).getTime(), endTime = new Date(year, 11, 31).getTime();
    param.find.attendTime = {$gte: startTime, $lt: endTime};
    return param;
  },
  waitOn: function() {
    if (!Meteor.userId() || !Meteor.user() || !Meteor.user().role) {
      return null;
    }
    return [
      Meteor.subscribe('courseAttendances', this.findOptions())
    ];
  },
  data: function() {
    return {
      year: this.getYear()
    };
  }
});
