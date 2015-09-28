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
    var now = Date.now(), curUserProfile = Meteor.user().profile;
    var name = curUserProfile?curUserProfile.name:"";
    TeacherAudit.update({userId:Meteor.userId()},{$set:{'name':name,submitTime:now,certInfo:{submitTime:now, status: 'submited'}}},{upsert:true});
    // TODO：用户操作日志 UserOpLogs
  },
  uploadCertificationForApp: function(params) {
    if (!params) {
      throw new Meteor.Error('参数错误', '没有数据');
    }
    var setObj = {}, ok = false;
    if (params['id'] && params['id'].url) {
      setObj.idCardImgUrl = params.id.url;
      ok = true;
    }
    if (params['edu'] && params['edu'].url) {
      setObj.eduCertImgUrl = params['edu'].url;
      ok = true;
    }
    if (params['teacher'] && params['teacher'].url) {
      setObj.teacherCertImgUrl = params['teacher'].url;
      ok = true;
    }
    if (params['profession'] && params['profession'].url) {
      setObj.professionItems = [{'certImgUrl': params['profession'].url}];
      ok = true;
    }
    if (!ok) {
      throw new Meteor.Error('参数错误', '没有数据');
    }
    UserCertification.update({userId:Meteor.userId()},{$set:setObj},{upsert:true});
    var now = Date.now(), curUserProfile = Meteor.user().profile;
    var name = curUserProfile?curUserProfile.name:"";
    TeacherAudit.update({userId:Meteor.userId()},{$set:{'name':name,submitTime:now,certInfo:{submitTime:now, status: 'submited'}}},{upsert:true});
    // TODO：用户操作日志 UserOpLogs
  }
})
