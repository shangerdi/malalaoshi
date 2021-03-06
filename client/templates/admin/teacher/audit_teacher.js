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
var convStatus2Indicator = function(status) {
  var statusDict = {'approved':"success",'submited':"warning",'rejected':"danger"};
  var str = statusDict[status];
  if (str) {
    return str;
  }
  return "warning";
}
var getPartAuditInfo = function(auditInfo, part) {
  return auditInfo[part+'Info'];
}
var getAuditStatus = function(auditInfo, part) {
  var partInfo = getPartAuditInfo(auditInfo, part);
  if (partInfo) {
    return partInfo.status;
  }
  return "";
}
Template.auditTeacher.helpers({
  auditInfo: function() {
    var auditInfo = TeacherAudit.findOne({'userId': Router.current().params.userId});
    return auditInfo;
  },
  getSubmitTime: function(part) {
    var auditInfo = TeacherAudit.findOne({'userId': Router.current().params.userId});
    var partInfo = getPartAuditInfo(auditInfo, part);
    if (!partInfo || !partInfo.submitTime) {
      return "";
    }
    var submitDate = new Date(partInfo.submitTime);
    return submitDate.getFullYear()+'-'+(submitDate.getMonth()+1)+'-'+submitDate.getDate()+' '+submitDate.getHours()+':'+submitDate.getMinutes();
  },
  isTodoAudit: function(part) {
    var auditInfo = TeacherAudit.findOne({'userId': Router.current().params.userId});
    var status = getAuditStatus(auditInfo, part);
    return (status=='submited');
  },
  getAuditStatus: function(part) {
    var auditInfo = TeacherAudit.findOne({'userId': Router.current().params.userId});
    var status = getAuditStatus(auditInfo, part);
    return status;
  },
  getAuditStatusStr: function(part) {
    var auditInfo = TeacherAudit.findOne({'userId': Router.current().params.userId});
    var status = getAuditStatus(auditInfo, part);
    return convStatus2Str(status);
  },
  getAuditStatusIndicator: function(part) {
    var auditInfo = TeacherAudit.findOne({'userId': Router.current().params.userId});
    var status = getAuditStatus(auditInfo, part);
    return convStatus2Indicator(status);
  },
  getAuditTime: function(part) {
    var auditInfo = TeacherAudit.findOne({'userId': Router.current().params.userId});
    var partInfo = getPartAuditInfo(auditInfo, part);
    if (!partInfo || !partInfo.auditTime) {
      return "";
    }
    var dateObj = new Date(partInfo.auditTime);
    return dateObj.getFullYear()+'-'+(dateObj.getMonth()+1)+'-'+dateObj.getDate()+' '+dateObj.getHours()+':'+dateObj.getMinutes();
  },
  basicInfo: function() {
    var user = Meteor.users.findOne(Router.current().params.userId);
    return user.profile;
  },
  getStateStr: function(state) {
    return getTeacherStateText(state);
  },
  getStageStr: function(v) {
    return getEduStageText(v);
  },
  getSubjectStr: function(v) {
    return getEduSubjectText(v);
  },
  getGradeStr: function(v) {
    if(v==="all") {
      return "全部";
    }
    return getEduGradeText(v);
  },
  address: function() {
    var basicInfo = Meteor.users.findOne(Router.current().params.userId).profile;
    if (!basicInfo || !basicInfo.address) {
      return "";
    }
    var addressStr = "", addrObj = basicInfo.address;
    if (addrObj.province && addrObj.province.code) {
      addressStr += addrObj.province.name;
    }
    if (addrObj.province && addrObj.province.type!=1) {
      if (addrObj.city && addrObj.city.code) {
        addressStr += addrObj.city.name;
      }
    }
    if (addrObj.district && addrObj.district.code) {
      addressStr += addrObj.district.name;
    }
    if (addrObj.road) {
      addressStr += addrObj.road;
    }
    return addressStr;
  },
  eduInfo: function() {
    return UserEducation.findOne({userId: Router.current().params.userId});
  },
  getDegreeStr: function(degree) {
    return getEduDegreeText(degree);
  },
  certInfo: function() {
    return UserCertification.findOne({userId: Router.current().params.userId});
  }
});
Template.auditTeacher.events({
  'click .btn-approve': function(e) {
    var ele = e.target, $ele = $(ele);
    var part = $ele.data('part');
    var userId = Router.current().params.userId;
    var params = {
      'userId': userId,
      'part': part
    };
    
    // do approve
    Meteor.call('auditApprove', params, function(error, result) {
      if (error)
        return throwError(error.reason);
    });
    $("."+part+"-info-reject").hide();
  },
  'click .btn-reject': function(e) {
    var ele = e.target, $ele = $(ele);
    var part = $ele.data('part');
    $("."+part+"-info-reject").show();
  },
  'click .btn-reject-confirm': function(e) {
    var ele = e.target, $ele = $(ele);
    var part = $ele.data('part');
    var userId = Router.current().params.userId;
    $rejectPart = $("."+part+"-info-reject");
    $rejectPart.removeClass("has-error");
    $rejectPart.find(".help-block").text("");
    
    var msg = $rejectPart.find("[name=rejectMsg]").val();
    if (!msg) {
      $rejectPart.addClass("has-error");
      $rejectPart.find(".help-block").text("驳回原因不能为空");
      return;
    }
    var params = {
      'userId': userId,
      'part': part,
      'msg': msg
    }

    // do reject
    Meteor.call('auditReject', params, function(error, result) {
      if (error) {
        return throwError(error.reason);
      }
      $("."+part+"-info-reject").hide();
    });
  },
  'click .img-box img':function(e) {
    var src = e.target.src;
    var $previewBox = $(".img-fullsize-view-box");
    $previewBox.find("img")[0].src=src;
    $previewBox.show();
  },
  'click .img-fullsize-view-box': function(e) {
    var ele = e.target, $ele = $(ele);
    if (ele.tagName.toLowerCase()=='img') {
      $ele = $ele.closest('.img-fullsize-view-box');
    }
    $ele.hide();
  }
});
