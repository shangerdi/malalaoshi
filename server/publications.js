var ifHasRole = function(userId, role) {
  var curUser = Meteor.users.findOne({_id: userId}, {fields: {role: 1}});
  if (curUser && curUser.role) {
    return curUser.role === role;
  }
  return false;
}
Meteor.publish("userData", function () {
  if (this.userId) {
    var subs = [Meteor.users.find({_id: this.userId},
                             {fields: {'role': 1, 'phoneNo': 1}})];
    var curUser = Meteor.users.findOne(this.userId);
    if (curUser.role==='teacher') {
      subs.push(TeacherAudit.find({userId: this.userId}));
    }
    return subs;
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
  //only admin users can get feedbacks
  if (ifHasRole(this.userId, 'admin')) {
    return Feedbacks.find();
  }
  return this.ready();
});
Meteor.publish('allusers', function() {
  //only admin users can get all users collection
  if (ifHasRole(this.userId, 'admin')) {
    return Meteor.users.find({}, {fields:{role:1,username:1,createdAt:1, profile:1}});
  }
  return this.ready();
});

Meteor.publish('allorders', function() {
  //only admin users can get all users orders
  if (ifHasRole(this.userId, 'admin')) {
    return Orders.find();
  }
  return this.ready();
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
    var find = {};
    var p = parameters.find;
    if(p){
      if(p['status.basic']){
        find = _.extend(find, {'status.basic': p['status.basic']});
      }
      if(p['profile.subjects.subject']){
        find = _.extend(find, {'profile.subjects.subject': p['profile.subjects.subject']});
      }
      if(p['profile.teacherType']){
        find = _.extend(find, {'profile.teacherType': p['profile.teacherType']});
      }
      if(p['profile.studyCenter']){
        find = _.extend(find, {'profile.studyCenter': p['profile.studyCenter']});
      }
      if(p['profile.subjects.grade']){
        var v = p['profile.subjects.grade'];
        if(v.startsWith('all')){
          // find = _.extend(find, {'profile.subjects.grade': 'all'});
          find = _.extend(find, {'profile.subjects.school': v.substring(4)});
        }else{
          find = _.extend(find, {'profile.subjects.grade': {$in : [v, 'all']}});
          find = _.extend(find, {'profile.subjects.school': v.substring(0, v.indexOf('_'))});
        }
      }
    }
    if(_.isEqual(find, {})){
      return [];
    }
    return Meteor.users.find(find, parameters.options);
  }
  return [];
});
Meteor.publish('teacher', function(userId) {
  if (this.userId && userId) {
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
Meteor.publish('studyCenters', function(params){
  if (!params || !params.find) {
    return StudyCenter.find();
  }
  return StudyCenter.find(params.find, params.options);
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
Meteor.publish('commentsByCourseAttendanceId', function(params) {
  if (this.userId && params) {
    return Comments.find({'courseAttendanceId': params.find.courseAttendanceId}, params.options);
  }
  return null;
});
Meteor.publish('commentsWidthUserDetail', function(params) {
  if (this.userId && params) {
    var comments = Comments.find(params.find, params.options);
    var userIds = [];
    comments.forEach(function(ct){
      userIds[userIds.length] = ct.teacher.id;
      userIds[userIds.length] = ct.student.id;
    });
    userIds = _.uniq(userIds);
    return [
      comments,
      Meteor.users.find({_id: {$in: userIds}})
    ];
  }
  return null;
});
Meteor.publish('userSummary', function(userId){
  if(this.userId){
    return UserSummary.find({'userId': userId});
  }
  return [];
});
Meteor.publish('commentsByType', function(params){
  if(this.userId && params.type){
    var comments = [];
    var cond = {
      'teacher.id': params.teacherId
    };
    if(params.type == 'goodComments'){
      cond.$where = 'this.maScore + this.laScore >= 8';
    }else if(params.type == 'averageComments'){
      cond.$where = 'this.maScore + this.laScore > 2 && this.maScore + this.laScore < 8';
    }else if(params.type == 'poolComments'){
      cond.$where = 'this.maScore + this.laScore <= 2';
    }
    if(!cond.$where){
      return [];
    }
    comments = Comments.find(cond, params.options);
    var userIds = [];
    comments.forEach(function(ct){
      userIds[userIds.length] = ct.teacher.id;
      userIds[userIds.length] = ct.student.id;
    });
    userIds = _.uniq(userIds);
    return [
      comments,
      Meteor.users.find({_id: {$in: userIds}})
    ];
  }
  return [];
});

Meteor.publish('areas', function(code) {
  if (!code) return null;
  if (typeof code === 'string') {
    return Areas.find({"code":code});
  } else if (_.isArray(code) && !_.isEmpty(code)) {
    return Areas.find({"code": {$in:code}});
  }
  return null;
});
Meteor.publish('areaProvinces', function(){
  return Areas.find({"level":1});
});
Meteor.publish('areasByParent', function(pCode){
  if (!pCode) return Areas.find({"level":1});
  return Areas.find({$or: [{'code': pCode}, {"parentCode":pCode}]});
});
