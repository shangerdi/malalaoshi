Template.feedbacks.helpers({
  feedbacks: function() {
    return Feedbacks.find({}, {sort: {createdAt:-1}});
  }
});
