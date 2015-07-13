Messages = new Mongo.Collection('messages');

Messages.attachSchema(new SimpleSchema({
  userId: {
    type: String,
    label: 'UserId',
    autoValue: function() {
      return userId;
    }
  },
  read: {
    type: Boolean,
    label: 'Viewed',
    defaultValue: false
  },
  content: {
    type: String,
    label: 'Content',
    max: 1024
  },
  createTime: {
    type: Number,
    label: 'Created at',
    autoValue: function() {
      if (!this.isSet) {
        return Date.now();
      }
    }
  }
}));

Messages.allow({
  update: function(userId, doc) {
    return ownsDocument(userId, doc);
  }
});
