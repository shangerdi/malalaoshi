Template.profileNav.helpers({
  isApproved: function(part) {
    var userAudit = TeacherAudit.findOne({'userId': Meteor.userId()});
    return userAudit && userAudit[part + 'Info'] &&
      userAudit[part + 'Info'].status === 'approved';
  }
});
Template.profileNav.events({
  'click .edit-profile': function(e) {
    Router.go('profileEditBasic');
  }
});
