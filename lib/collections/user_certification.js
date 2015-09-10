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
  idCardImgUrl: {
    type: String,
    label: 'Identity Card Image Url',
    optional: true
  },
  eduCertImgUrl: {
    type: String,
    label: 'Education Certification Image Url',
    optional: true
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
