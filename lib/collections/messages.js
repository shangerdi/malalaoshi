Messages = new Mongo.Collection('messages');

// ['system', 'finance', 'course', 'audit', 'comment'];
var _typesDict = {
  'system': "系统消息",
  'finance': "收入消息",
  'course': "课程消息",
  'audit': "审核消息",
  'comment': "评论消息"
};
var _types = _.keys(_typesDict);

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
  type: {
    type: String,
    label: 'Type',
    allowedValues: _types,
    defaultValue: _types[0]
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

Messages.Types = _types;
Messages.getTitleByType = function(type) {
  return _typesDict[type];
}
