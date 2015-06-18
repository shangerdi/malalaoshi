Meteor.methods({
  insertFeedback: function(content) {
    if (!content) {
      throw new Meteor.Error('参数错误', '请填写反馈内容');
    }
    var obj = {
      userId: this.userId,
      content: content,
      created: Date.now()
    };
    Feedbacks.insert(obj);
  }
})
