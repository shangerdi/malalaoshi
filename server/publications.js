Meteor.publish('areas', function() {
  return Areas.find();
});
