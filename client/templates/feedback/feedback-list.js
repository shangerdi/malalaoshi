Template.feedbacks.helpers({
  feedbacks: function() {
    return Feedbacks.find();
  }
});
Template.feedbackItem.helpers({
  created: function() {
    return moment(this.created, 'x').fromNow();
  }
});

