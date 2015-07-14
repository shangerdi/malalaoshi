Template.users.helpers({
  users: function() {
    return Meteor.users.find({}, {sort:{createdAt:-1}});
  },
  userCount: function() {
    return Meteor.users.find().count();
  }
});
