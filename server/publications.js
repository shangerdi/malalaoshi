Meteor.publish("userData", function () {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId},
                             {fields: {'role': 1, 'phoneNo': 1}});
  } else {
    this.ready();
  }
});
Meteor.publish("userAvatars", function(userIds){
  return Meteor.users.find({_id:{$in: userIds}}, {fields: {'profile.avatarUrl': 1}});
});
Meteor.publish('messages', function() {
  return Messages.find({userId: this.userId});
});
Meteor.publish('feedbacks', function() {
  return Feedbacks.find();
});
Meteor.publish('allusers', function() {
  return Meteor.users.find({}, {fields:{role:1,username:1,createdAt:1, profile:1}});
});

Meteor.publish('allorders', function() {
  return Orders.find({});
});

Meteor.publish('curUserEducation', function() {
  return UserEducation.find({userId: this.userId});
});
Meteor.publish('curUserCertification', function() {
  return UserCertification.find({userId: this.userId});
});
Meteor.publish('teacherAvailableTime', function(teacherId) {
  if (this.userId && teacherId) {
    return TeacherAvailableTimes.find({"teacher.id": teacherId});
  }
  return null;
});
Meteor.publish('areaTimePhases', function(code) {
  if (typeof code === 'string') {
    return AreaTimePhases.find({"code":code});
  } else if (_.isArray(code)) {
    return AreaTimePhases.find({"code": {$in:code}});
  }
  return null;
});
Meteor.publish('areaTimePhasesByTeacher', function(teacherId) {
  if (!this.userId || !teacherId) {
    return null;
  }
  var teacher = Meteor.users.findOne({_id:teacherId});
  if (!teacher) {
    return null;
  }
  var address = teacher.profile.address, code=[];
  if (address.province.code) {
    code.push(address.province.code);
  }
  if (address.city.code) {
    code.push(address.city.code);
  }
  if (address.district.code) {
    code.push(address.district.code);
  }
  return [
    Meteor.users.find({_id: teacherId}, {fields: {'profile': 1}}),
    AreaTimePhases.find({"code": {$in:code}})
  ];
});
Meteor.publish('courseAttendances', function(params) {
  if (this.userId && params) {
    return CourseAttendances.find(params.find, params.options);
  }
  return null;
});
Meteor.publish('courseAttendancesWithTeacher', function(params) {
  if (this.userId && params) {
    var cts = CourseAttendances.find(params.find, params.options);
    var teacherIds = [];
    cts.forEach(function(ct){
      teacherIds[teacherIds.length] = ct.teacher.id;
    });
    teacherIds = _.uniq(teacherIds);
    return [
      cts,
      Meteor.users.find({_id: {$in: teacherIds}})
    ];
  }
  return null;
});

Meteor.publish('teacherAudits', function(param) {
  var curUser = Meteor.users.findOne(this.userId);
  if (!curUser) {
    this.ready();
    return;
  }
  if (curUser.role=='admin'||curUser.role=='manager') {
    return TeacherAudit.find(param.find, param.options);
  } else {
    return TeacherAudit.find({userId: this.userId});
  }
});
Meteor.publish("auditOneTeacher", function (userId) {
  var curUser = Meteor.users.findOne(this.userId);
  if (curUser.role!='admin'&&curUser.role!='manager') {
    return [];
  }
  check(userId, String);
  return [
    Meteor.users.find({_id: userId}, {fields: {'profile': 1}}),
    UserEducation.find({'userId': userId}),
    UserCertification.find({'userId': userId}),
    TeacherAudit.find({'userId': userId})
  ];
});
Meteor.publish('pages', function() {
  var clm = Pages.find();
  return clm;
});
Meteor.publish('teachers', function(parameters) {
  if (this.userId) {
    return Meteor.users.find(parameters.find, parameters.options);
  }
  return [];
});
Meteor.publish('teacher', function(userId) {
  if (this.userId) {
    var teacher = Meteor.users.findOne({"_id": userId, "status.basic": "approved"},{"studyCenter": 1});
    var studyCenterIds = teacher && teacher.profile && teacher.profile.studyCenter ? teacher.profile.studyCenter : [];
    return [
      Meteor.users.find({"_id": userId, "status.basic": "approved"}),
      UserEducation.find({'userId': userId}),
      TeacherAudit.find({'userId': userId}),
      StudyCenter.find({"_id": {$in: studyCenterIds}})
    ];
  }
  return [];
});
Meteor.publish('order', function(parameters) {
  if (this.userId && parameters) {
    var ret = [];
    if(parameters.orderId){
      ret[ret.length] = Orders.find({_id: parameters.orderId});
      if(!parameters.userIds){
        parameters.userIds = [];
      }
      ret[ret.length-1].forEach(function (item) {
        parameters.userIds[parameters.userIds.length] = item.teacher.id;
        parameters.userIds[parameters.userIds.length] = item.student.id;
      });
      parameters.userIds = _.compact(parameters.userIds);
    }
    if(parameters.userIds && parameters.userIds.length > 0){
      ret[ret.length] = Meteor.users.find({_id: {"$in": parameters.userIds}});
    }

    return ret;
  }
  return null;
});

Meteor.publish('orders', function(parameters) {
  if (this.userId) {
    return Orders.find(parameters.find, parameters.options);
  }
  return [];
});
