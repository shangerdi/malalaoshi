UserSummary = new Mongo.Collection('userSummary');

UserSummary.attachSchema(new SimpleSchema({
  goodComments: {
    type: Number,
    label: 'Good commnets'
  },
  averageComments: {
    type: Number,
    label: 'Average commnets'
  },
  poolComments: {
    type: Number,
    label: 'Pool commnets'
  },
  userId: {
    type: String,
    label: 'UserId'
  }
}));
