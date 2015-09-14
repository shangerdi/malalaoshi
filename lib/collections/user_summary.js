UserSummary = new Mongo.Collection('userSummary');

UserSummary.attachSchema(new SimpleSchema({
  goodComments: {
    type: Number,
    optional: true,
    label: 'Good commnets'
  },
  averageComments: {
    type: Number,
    optional: true,
    label: 'Average commnets'
  },
  poolComments: {
    type: Number,
    optional: true,
    label: 'Pool commnets'
  },
  userId: {
    type: String,
    label: 'UserId'
  }
}));
