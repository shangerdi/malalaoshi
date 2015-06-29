Template.pageDetail.helpers({
  isAdmin: function() {
    return Meteor.user() && Meteor.user().role === 'admin';
  }
});