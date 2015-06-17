Messages = new Mongo.Collection('messages');

Messages.allow({
  update: function(userId, doc) {
    return ownsDocument(userId, doc);
  }
});