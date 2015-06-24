Template.users.helpers({
  users: function() {
    return Meteor.users.find();
  },
  userCount: function() {
    return Meteor.users.find().count();
  }
});
Template.userItem.helpers({
  created: function() {
    return moment(this.createdAt).fromNow();
  }
});

