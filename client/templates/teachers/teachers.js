Template.teachers.helpers({
  teachers: function() {
    return UserAudit.find({}, {sort: {submitTime: 1}});
  }
});
var convStatus2Str = function(status) {
  if (!status) {
    return "未提交";
  }
  if (status == 'approved') {
    return "通过";
  }
  if (status == 'submited') {
    return "待审核";
  }
  if (status == 'rejected') {
    return "被驳回";
  }
  return "-";
}
Template.userAuditItem.helpers({
  submitTime: function() {
    return moment(this.submitTime, 'x').fromNow();
  },
  name: function() {
    console.log(Meteor.users.findOne(this.userId));
    return this.userId;
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
