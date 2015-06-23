Meteor.methods({
  updateCertification: function(teacherCertImgUrl, professionItems) {
    if (!professionItems) {
      throw new Meteor.Error('参数错误', '没有数据');
    }
    _.each(professionItems, function(ele) {
      if (!ele.certImgUrl) {
        throw new Meteor.Error('参数错误', '请确定所有信息填写完整')
      }
    });
    UserCertification.update({userId:Meteor.userId()},{$set:{'teacherCertImgUrl':teacherCertImgUrl,'professionItems':professionItems}},{upsert:true});
  }
})
