Template.auditTeachers.helpers({
  teachers: function() {
    return TeacherAudit.find({}, {sort: {submitTime: 1}});
  }
});
var convStatus2Str = function(status) {
  if (!status) {
    return "未提交";
  }
  var statusDict = {'approved':"通过",'submited':"待审核",'rejected':"被驳回"};
  var str = statusDict[status];
  if (str) {
    return str;
  }
  return "-";
}
Template.userAuditItem.helpers({
  submitTime: function() {
    return moment(this.submitTime, 'x').fromNow();
  },
  basicInfoAuditStatus: function() {
    if (this.basicInfo && this.basicInfo.status) {
      return convStatus2Str(this.basicInfo.status);
    } else {
      return convStatus2Str(false);
    }
  },
  eduInfoAuditStatus: function() {
    if (this.eduInfo && this.eduInfo.status) {
      return convStatus2Str(this.eduInfo.status);
    } else {
      return convStatus2Str(false);
    }
  },
  certInfoAuditStatus: function() {
    if (this.certInfo && this.certInfo.status) {
      return convStatus2Str(this.certInfo.status);
    } else {
      return convStatus2Str(false);
    }
  },
  auditTime: function() {
    if (!this.auditTime) {
      return "-";
    }
    return moment(this.auditTime, 'x').fromNow();
  }
});
Template.userAuditItem.events({
  'click .btn-audit': function(e) {
    Router.go('auditTeacher', {_userId: Template.instance().data.userId});
  }
});
