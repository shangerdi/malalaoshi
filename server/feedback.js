Meteor.methods({
  insertFeedback: function(content, contact) {
    if (!content) {
      throw new Meteor.Error('参数错误', '请填写反馈内容');
    }
    var user = Meteor.user();
    var obj = {
      userId: this.userId,
      name: user.profile.name,
      phoneNo: user.phoneNo,
      content: content,
      contact: contact
    };
    Feedbacks.insert(obj);
  }
})
