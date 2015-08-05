UserStatusSchema = new SimpleSchema({
  basic:{
    type: String,
    optional: true,
    label: 'Basic'
  },
  cert: {
    type: String,
    optional: true,
    label: 'Cert'
  },
  edu: {
    type: String,
    optional: true,
    label: 'edu'
  }
});
UserAddressDetailSchema = new SimpleSchema({
  code:{
    type: String,
    label: 'address code'
  },
  name: {
    type: String,
    label: 'address name'
  }
});
UserAddressSchema = new SimpleSchema({
  province: {
    type: UserAddressDetailSchema
  },
  city: {
    type: UserAddressDetailSchema
  },
  district: {
    type: UserAddressDetailSchema
  }
});
UserSubjectsSchema = new SimpleSchema({
  school:{
    type: String,
    label: 'School'
  },
  subject: {
    type: String,
    label: 'Subject'
  },
  grade: {
    type: String,
    label: 'Grade'
  }
});
ProfileSchema = new SimpleSchema({
  name:{
    type: String,
    label: 'User name'
  },
  avatarUrl: {
    type: String,
    optional: true,
    label: 'Avatar url'
  },
  gender: {
    type: String,
    label: 'Gender',
    optional: true,
    allowedValues: ['男', '女']
  },
  birthday: {
    type: String,
    label: 'Birthday',
    optional: true
  },
  state: {
    type: String,
    label: 'State',
    optional: true
  },
  selfIntro: {
    type: String,
    optional: true,
    label: 'Self intro'
  },
  subjects: {
    optional: true,
    type: [UserSubjectsSchema]
  },
  address: {
    optional: true,
    type: UserAddressSchema
  }
});

Meteor.users.attachSchema(new SimpleSchema({
  createdAt: {
    type: Date,
    label: 'Created at'
  },
  username:{
    type: String,
    label: 'User name'
  },
  phoneNo:{
    type: String,
    label: 'Phone No'
  },
  role: {
    type: String,
    label: 'Role',
    allowedValues: ['admin', 'teacher', 'parent', 'manager', 'student']
  },
  profile: {
    type: ProfileSchema
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  },
  status: {
    optional: true,
    type: UserStatusSchema
  }
}));

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
