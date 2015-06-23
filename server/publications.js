Meteor.publish('areas', function() {
  return Areas.find();
});
Meteor.publish("userData", function () {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId},
                             {fields: {'role': 1}});
  } else {
    this.ready();
  }
});
Meteor.publish('messages', function() {
  return Messages.find({userId: this.userId, read: {$ne: true}});
});
Meteor.publish('feedbacks', function() {
  return Feedbacks.find();
});
Meteor.publish('allusers', function() {
  return Meteor.users.find({}, {fields:{role:1,username:1}});
});

Meteor.publish('curUserEducation', function() {
  return UserEducation.find({userId: this.userId});
});
