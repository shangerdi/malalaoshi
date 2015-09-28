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
var isProfileAuditedFail = function() {
  var auditObj = getAuditObj();
  return auditObj && auditObj.basicInfo && auditObj.basicInfo.status==='rejected';
}
var isPassed = function() {
  var auditObj = getAuditObj();
  return auditObj && (auditObj.applyStatus==='passed' || auditObj.applyStatus==='started');
}
Template.applicationProgress.helpers({
  getClass: function(step) {
    if (step==='register') {
      return 'ok';
    }
    if (step==='submit' && isProfileSubmited()) {
      return 'ok';
    }
    if (step==='audit') {
      if (isProfileAudited()) {
        return 'ok';
      }
      if (isProfileAuditedFail()) {
        return 'fail';
      }
    }
    if (step==='complete' && isPassed()) {
      return 'ok';
    }
  },
  getTime: function(step) {
    if (step==='register') {
      return moment(Meteor.user().createdAt).fromNow();
    }
    var auditObj = getAuditObj();
    if (step==='submit' && isProfileSubmited()) {
      return moment(auditObj.basicInfo.submitTime).fromNow();
    }
    if (step==='audit') {
      if (isProfileAudited() || isProfileAuditedFail()) {
        return moment(auditObj.basicInfo.auditTime).fromNow();
      }
      return "...";
    }
    if (step==='complete' && isPassed()) {
      return moment(auditObj.auditTime).fromNow();
    }
  },
  isProfileAudited: function() {
    return isProfileAudited();
  },
  isProfileAuditedFail: function() {
    return isProfileAuditedFail();
  },
  getAuditMsg: function() {
    var auditObj = getAuditObj();
    if (isProfileAuditedFail()) {
      return auditObj.basicInfo.msg;
    }
    if (isProfileAudited()) {
      return '审核成功';
    }
    return "敬请期待";
  },
  isPassed: function() {
    return isPassed();
  }
});
Template.applicationProgress.events({
  'click #editProfileBtn': function() {
    Router.go('applicationInfo');
  },
  'click #start': function() {
    Meteor.call('startAsTeacher', function(err, result) {
      if (err) {
        alert(err.reason);
        return;
      }
      Router.go('dashboard');
    });
  }
});
Template._appProgPopover.onRendered(function(){
  $(".popover").height("auto");
});
Template._appProgPopover.events({
  'click .btn-logout': function(e) {
    var doLogout = function() {
      IonPopover.hide();
      Meteor.logout();
      // Router.go('home');
    };
    doLogout();
  }
});

