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
var isPassed = function() {
  var auditObj = getAuditObj();
  return auditObj && auditObj.applyStatus==='passed';
}
Template.applicationProgress.helpers({
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
    if (step==='complete' && isPassed()) {
      return 'ok';
    }
  },
  isProfileAudited: function() {
    return isProfileAudited();
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

