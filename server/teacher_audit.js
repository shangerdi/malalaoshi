Meteor.methods({
  auditApprove: function(params) {
    var curUser = Meteor.users.findOne(this.userId);
    if (curUser.role!='admin'&&curUser.role!='manager') {
      throw new Meteor.Error('没有权限', '您没有权限，若有疑问请联系管理员');
    }
    check(params, {
      userId: String,
      part: String
    });
    if(!_.contains(['basic','edu','cert'], params.part)) {
      throw new Meteor.Error('参数错误', '参数错误');
    }

    // do approve
    var part = params.part, todoUserId = params.userId;
    var now = Date.now(), newStatus = 'approved', updateSet = {auditTime:now, auditUserId:this.userId};
    updateSet[part+'Info.status'] = newStatus; // NOTE: the update $set object is diff from common js object, it's like "{auditTime:now, auditUserId:this.userId, 'basicInfo.status':newStatus, 'basicInfo.auditTime':now, 'basicInfo.auditUserId':this.userId}"
    updateSet[part+'Info.auditTime'] = now;
    updateSet[part+'Info.auditUserId'] = this.userId;
    TeacherAudit.update({'userId':todoUserId},{$set:updateSet});
    var statusObj = {};
    statusObj["status."+part] = newStatus;
    Meteor.users.update({_id: todoUserId}, {$set: statusObj});
    // op logs
    var logObj = {'userId':todoUserId,auditTime:now, auditUserId:this.userId,'part':part};
    logObj[part+'Info'] = {};
    logObj[part+'Info'].status = newStatus;
    logObj[part+'Info'].auditTime = now;
    logObj[part+'Info'].auditUserId = this.userId;
    TeacherAuditLogs.insert(logObj);
    // notify the user
    var partName = {'basic':"个人资料基本信息",'edu':"教育信息",'cert':"教学资质"}[part];
    var noticeObj = {
      'userId':todoUserId,
      'content':"亲，您提交的【"+partName+"】已通过审核。非常感谢您对我们的信赖和支持！",
    };
    Messages.insert(noticeObj);
  },
  auditReject: function(params) {
    var curUser = Meteor.users.findOne(this.userId);
    if (curUser.role!='admin'&&curUser.role!='manager') {
      throw new Meteor.Error('没有权限', '您没有权限，若有疑问请联系管理员');
    }
    check(params, {
      userId: String,
      part: String,
      msg: String
    });
    if(!_.contains(['basic','edu','cert'], params.part)) {
      throw new Meteor.Error('参数错误', '参数错误');
    }

    // do reject
    var part = params.part, todoUserId = params.userId, msg = params.msg;
    var now = Date.now(), newStatus = 'rejected', updateSet = {auditTime:now, auditUserId:this.userId};
    updateSet[part+'Info.status'] = newStatus; // NOTE: the update $set object is diff from common js object
    updateSet[part+'Info.msg'] = msg;
    updateSet[part+'Info.auditTime'] = now;
    updateSet[part+'Info.auditUserId'] = this.userId;
    TeacherAudit.update({'userId':todoUserId},{$set:updateSet});
    var statusObj = {};
    statusObj["status."+part] = newStatus;
    Meteor.users.update({_id: todoUserId}, {$set: statusObj});
    // op logs
    var logObj = {'userId':todoUserId,auditTime:now, auditUserId:this.userId,'part':part};
    logObj[part+'Info'] = {};
    logObj[part+'Info'].status = newStatus;
    logObj[part+'Info'].msg = msg;
    logObj[part+'Info'].auditTime = now;
    logObj[part+'Info'].auditUserId = this.userId;
    TeacherAuditLogs.insert(logObj);
    // notify the user
    var partName = {'basic':"个人资料基本信息",'edu':"教育信息",'cert':"教学资质"}[part];
    var noticeObj = {
      'userId':todoUserId,
      'content':"亲，您提交的【"+partName+"】没有通过审核，(原因是："+msg+")，请您再修改一下吧",
    };
    Messages.insert(noticeObj);
  },
  startAsTeacher: function() {
    var curUser = Meteor.users.findOne(this.userId);
    if (curUser.role!='teacher') {
      throw new Meteor.Error('没有权限', '您没有权限，若有疑问请联系管理员');
    }
    var auditObj = TeacherAudit.findOne({'userId': this.userId});
    if (!auditObj || auditObj.applyStatus!='passed') {
      throw new Meteor.Error('没有权限', '您还没有通过审核，若有疑问请联系管理员');
    }
    TeacherAudit.update({'userId':this.userId},{$set:{'applyStatus': 'started'}});
  }
});
