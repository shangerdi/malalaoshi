var getAuditObj = function() {
  if (!Meteor.userId()) return null;
  return TeacherAudit.findOne({'userId': Meteor.userId()});
}
var isProfileSubmited = function() {
  var auditObj = getAuditObj();
  return auditObj && auditObj.basicInfo && auditObj.basicInfo.status;
}
var isProfileAudited = function() {
  var auditObj = getAuditObj();
  return auditObj && auditObj.basicInfo && auditObj.basicInfo.status==='approved';
}
var isComplete = function() {
  var auditObj = getAuditObj();
  return auditObj && auditObj.isQualified;
}
Template.applyTeacherProgress.helpers({
  getClass: function(step) {
    if (step==='register') {
      return 'ok';
    }
    if (step==='submit' && isProfileSubmited()) {
      return 'ok';
    }
    if (step==='audit' && isProfileAudited()) {
      return 'ok';
    }
    if (step==='complete' && isComplete()) {
      return 'ok';
    }
  },
  isProfileAudited: function() {
    return isProfileAudited();
  }
});