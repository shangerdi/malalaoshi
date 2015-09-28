var certUploadRoute = 'mineProfileCertUpload';
var convStatus2Str = function(status) {
  if (!status) {
    return "未设置";
  }
  var statusDict = {'approved':"通过",'submited':"待审核",'rejected':"被驳回"};
  var str = statusDict[status];
  if (str) {
    return str;
  }
  return "-";
}
var getAuditObj = function() {
  if (!Meteor.userId()) return null;
  return TeacherAudit.findOne({'userId': Meteor.userId()});
}
Template.mineProfileCert.helpers({
  getAuditStatusStr: function(field) {
    var auditObj = getAuditObj();
    if (auditObj) {
      var certInfo = auditObj.certInfo;
      if (certInfo) {
        return convStatus2Str(certInfo.status);
      }
    }
    return '未设置';
  },
  pathForId: function() {
    return Router.routes[certUploadRoute].path({'certType': "id"});
  },
  pathForEdu: function() {
    return Router.routes[certUploadRoute].path({'certType': "edu"});
  },
  pathForTeacher: function() {
    return Router.routes[certUploadRoute].path({'certType': "teacher"});
  },
  pathForProfession: function() {
    return Router.routes[certUploadRoute].path({'certType': "profession"});
  }
});
