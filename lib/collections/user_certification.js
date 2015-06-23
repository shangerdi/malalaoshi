UserCertification = new Mongo.Collection('userCertification');

UserCertification.allow({
  update: function(userId, doc) {
    return ownsDocument(userId, doc);
  }
});