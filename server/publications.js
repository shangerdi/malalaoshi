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
