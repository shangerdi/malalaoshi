Messages = new Mongo.Collection('messages');

Messages.attachSchema(new SimpleSchema({
  userId: {
    type: String,
    label: 'UserId'
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
  createdAt: {
    type: Number,
    label: 'Created at',
    autoValue: function() {
      if (this.isInsert) {
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
