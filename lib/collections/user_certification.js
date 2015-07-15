UserCertification = new Mongo.Collection('userCertification');

var UserCertProfessionItemSchema = new SimpleSchema({
  certImgUrl: {
    type: String,
    label: 'Certification Image Url'
  }
});
UserCertification.attachSchema(new SimpleSchema({
  userId: {
    type: String,
    label: 'User Id',
    index: true
  },
  teacherCertImgUrl: {
    type: String,
    label: 'Teacher Qualified Certification Image Url',
    optional: true
  },
  professionItems: {
    type: [UserCertProfessionItemSchema],
    optional: true
  }
}));

UserCertification.allow({
  update: function(userId, doc) {
    return ownsDocument(userId, doc);
  }
});