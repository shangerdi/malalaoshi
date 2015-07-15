Feedbacks = new Mongo.Collection('feedbacks');

Feedbacks.attachSchema(new SimpleSchema({
  userId: {
    type: String,
    label: 'UserId'
  },
  phoneNo: {
    type: String,
    label: 'Phone Number',
    max: 20
  },
  name: {
    type: String,
    label: 'Name',
    max: 30
  },
  content: {
    type: String,
    label: 'Content',
    max: 2048
  },
  createdAt: {
    type: Number,
    label: 'Created at',
    autoValue: function() {
      if (this.isInsert) {
        return Date.now();
      }
    }
  },
  read: {
    type: Boolean,
    label: 'Viewed',
    defaultValue: false
  }
}));
