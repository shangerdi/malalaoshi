UserEducation = new Mongo.Collection('userEducation');

UserEducation.allow({
  update: function(userId, doc) {
    return ownsDocument(userId, doc);
  }
});