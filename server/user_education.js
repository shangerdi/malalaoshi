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
    var now = Date.now(), curUserProfile = Meteor.user().profile;
    var name = curUserProfile?curUserProfile.name:"";
    TeacherAudit.update({userId:Meteor.userId()},{$set:{'name':name,submitTime:now,eduInfo:{submitTime:now, status: 'submited'}}},{upsert:true});
    // TODO：用户操作日志 UserOpLogs
  }
})
