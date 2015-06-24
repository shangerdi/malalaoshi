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
    var auditInfo = UserAudit.findOne({'userId': Router.current().params._userId});
    return auditInfo;
  },
  getSubmitTime: function(part) {
    var auditInfo = UserAudit.findOne({'userId': Router.current().params._userId});
    var partInfo = getPartAuditInfo(auditInfo, part);
    if (!partInfo || !partInfo.submitTime) {
      return "";
    }
    var submitDate = new Date(partInfo.submitTime);
    return submitDate.getFullYear()+'-'+(submitDate.getMonth()+1)+'-'+submitDate.getDate()+' '+submitDate.getHours()+':'+submitDate.getMinutes();
  },
  isTodoAudit: function(part) {
    var auditInfo = UserAudit.findOne({'userId': Router.current().params._userId});
    var status = getAuditStatus(auditInfo, part);
    return (status=='submited');
  },
  getAuditStatus: function(part) {
    var auditInfo = UserAudit.findOne({'userId': Router.current().params._userId});
    var status = getAuditStatus(auditInfo, part);
    return status;
  },
  getAuditStatusStr: function(part) {
    var auditInfo = UserAudit.findOne({'userId': Router.current().params._userId});
    var status = getAuditStatus(auditInfo, part);
    return convStatus2Str(status);
  },
  getAuditTime: function(part) {
    var auditInfo = UserAudit.findOne({'userId': Router.current().params._userId});
    var partInfo = getPartAuditInfo(auditInfo, part);
    if (!partInfo || !partInfo.auditTime) {
      return "";
    }
    var dateObj = new Date(partInfo.auditTime);
    return dateObj.getFullYear()+'-'+(dateObj.getMonth()+1)+'-'+dateObj.getDate()+' '+dateObj.getHours()+':'+dateObj.getMinutes();
  },
  basicInfo: function() {
    var user = Meteor.users.findOne(Router.current().params._userId);
    return user.profile;
  },
  state: function() {
    var basicInfo = Meteor.users.findOne(Router.current().params._userId).profile;
    if (!basicInfo || !basicInfo.state) {
      return "";
    }
    var stateMap = {
      1: "在职教师",
      2: "准教师"
    };
    var stateStr = stateMap[basicInfo.state];
    return stateStr;
  },
  address: function() {
    var basicInfo = Meteor.users.findOne(Router.current().params._userId).profile;
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
    return UserEducation.findOne({userId: Router.current().params._userId});
  },
  getDegreeStr: function(degree) {
    var degreeMap = {
      "postDoctor":"博士后",
      "doctor":"博士",
      "master":"硕士",
      "bachelor":"本科",
      "vocational":"专科",
      "highSchool":"高中"
    };
    return degreeMap[degree];
  },
  certInfo: function() {
    return UserCertification.findOne({userId: Router.current().params._userId});
  }
});
Template.auditTeacher.events({
  'click .btn-approve': function(e) {
    var ele = e.target, $ele = $(ele);
    var part = $ele.data('part');
    var userId = Router.current().params._userId;
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
    var userId = Router.current().params._userId;
    $rejectPart = $("."+part+"-info-reject");
    $rejectPart.removeClass("has-error");
    $rejectPart.find(".help-block").text("");
    var msg = $rejectPart.find("[name=rejectMsg]").val();
    if (!msg) {
      $rejectPart.addClass("has-error");
      $rejectPart.find(".help-block").text("驳回原因不能为空");
      return;
    }
  }
});
