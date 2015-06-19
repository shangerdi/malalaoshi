Meteor.methods({
  updateEducation: function(eduItems) {
    if (!eduItems) {
      throw new Meteor.Error('参数错误', '没有数据');
    }
    _.each(eduItems, function(ele) {
      if (!ele.degree || !ele.college || !ele.major) {
        throw new Meteor.Error('参数错误', '请确定所有信息填写完整')
      }
    });
    UserEducation.update({userId:Meteor.userId()},{$set:{'eduItems':eduItems}},{upsert:true});
  }
})
