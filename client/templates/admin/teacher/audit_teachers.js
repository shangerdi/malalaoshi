Template.auditTeachers.helpers({
  // teachers: function() {
  //   return TeacherAudit.find({}, {sort: {submitTime: 1}});
  // }
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
  auditStatus: function(part) {
    var partInfo = this[part+'Info'];
    if (partInfo) {
      return partInfo.status;
    }
    return 'unsubmit';
  },
  auditStatusStr: function(part) {
    var partInfo = this[part+'Info'];
    if (partInfo) {
      return convStatus2Str(partInfo.status);
    }
    return convStatus2Str(false);
  },
  auditTime: function() {
    if (!this.auditTime) {
      return "-";
    }
    return moment(this.auditTime, 'x').fromNow();
  },
  actionText: function() {
    var unsubmitCount=0, todo=false, _selfData=this;
    _.each(TeacherAuditParts, function(part){
      var partInfo = _selfData[part+'Info'];
      if (!partInfo || !partInfo.status) {
        unsubmitCount++;
      } else if (partInfo.status==='submited') {
        todo=true;
      }
    });
    if (unsubmitCount===3) {
      return "-";
    }
    if (todo) {
      return "审核";
    }
    return "查看";
  }
});
Template.userAuditItem.events({
  'click .btn-audit': function(e) {
    Router.go('auditTeacher', {_userId: Template.instance().data.userId});
  }
});
