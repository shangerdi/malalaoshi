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
    var part = params.part, todoUserId = params.userId;
    var now = Date.now();
    if (part=='basic') {
      UserAudit.update({'userId':todoUserId},{$set:{auditTime:now, auditUserId:this.userId, 'basicInfo.status':'approved', 'basicInfo.auditTime':now, 'basicInfo.auditUserId':this.userId}});
      // TODO: userAuditLogs
    } else if (part=='edu') {
      UserAudit.update({'userId':todoUserId},{$set:{auditTime:now, auditUserId:this.userId, 'eduInfo.status':'approved', 'eduInfo.auditTime':now, 'eduInfo.auditUserId':this.userId}});
      // TODO: userAuditLogs
    } else if (part=='cert') {
      UserAudit.update({'userId':todoUserId},{$set:{auditTime:now, auditUserId:this.userId, 'certInfo.status':'approved', 'certInfo.auditTime':now, 'certInfo.auditUserId':this.userId}});
      // TODO: userAuditLogs
    } else {
      throw new Meteor.Error('参数错误', '参数错误');
    }
  }
});
