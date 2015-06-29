Template.users.helpers({
  users: function() {
    return Meteor.users.find();
  },
  userCount: function() {
    return Meteor.users.find().count();
  }
});
