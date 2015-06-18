Feedbacks = new Mongo.Collection('feedbacks');

Feedbacks.allow({
  update: function(userId, doc) {
    return ownsDocument(userId, doc);
  }
});
