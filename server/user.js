Meteor.methods({
  updateUserRole: function(user) {
    check(user, {
      role: String,
      id: String
    });

    var curUser = Meteor.user();
    if (!curUser || !(curUser.role === 'admin')){
        throw new Meteor.Error('权限不足', "当前用户权限不足");
    }
    if(user.id == curUser._id){
        throw new Meteor.Error('错误', "自己不能修改自己角色");
    }

    return Meteor.users.update({_id: user.id}, {$set: {"role": user.role}});
  }
});
Meteor.methods({
  updateProfile: function(profile) {
    check(profile, {
      name: String,
      // nickname: String,
      gender: String,
      birthday: String,
      state: String,
      subjects: Array,
      // college: String,
      // degree: String,
      // major: String,
      address: Object,
      selfIntro: String//,
      // motto: String
    });

    var errors = validateProfile(profile);
    if (!!errors.hasError) {
      throw new Meteor.Error('无效设置', "参数设置错误");
    }

    var oldProfile = Meteor.user().profile;
    if (oldProfile) {
      profile = _.extend(Meteor.user().profile, profile);
    }
    // console.log(profile);
    var setObj = {profile:profile};
    if (Meteor.user().role=='teacher') {// teachers need to audit
      var now = Date.now();
      TeacherAudit.update({userId:Meteor.userId()},{$set:{name:profile.name,submitTime:now,basicInfo:{submitTime:now, status: 'submited'}}},{upsert:true});
      setObj["status.basic"] = "submited";
    }
    Meteor.users.update({_id: Meteor.userId()}, {$set: setObj});
    // TODO：用户操作日志 UserOpLogs
  }
});
