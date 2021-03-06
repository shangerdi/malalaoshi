UserLocationSchema = new SimpleSchema({
  lng:{
    type: Number,
    decimal: true,
    label: 'Longitude'
  },
  lat: {
    type: Number,
    decimal: true,
    label: 'Latitude'
  },
  title:{
    type: String,
    optional: true,
    label: 'Title'
  },
  address:{
    type: String,
    optional: true,
    label: 'Address'
  }
});
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
  },
  teachingCert: {
    type: String,
    optional: true,
    label: 'Teaching certificate'
  },
  specialty: {
    type: String,
    optional: true,
    label: 'Specialty'
  },
  maLaCert: {
    type: String,
    optional: true,
    label: 'Ma la certificate'
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
  },
  road: {
    type: String,
    label: 'Road',
    optional: true,
    max: 300
  }
});
UserSubjectsSchema = new SimpleSchema({
  stage:{
    type: String,
    label: 'Stage'
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
var _subjectPriceSchema = new SimpleSchema({
  subject: {
    type: String,
    label: '科目',
    optional: true
  },
  grade: {
    type: String,
    label: '年级',
    optional: true
  },
  stage: {
    type: String,
    label: '阶段',
    optional: true
  },
  price: {
    type: Number,
    label: 'Price / Hour'
  }
});
var serviceAreaSchema = new SimpleSchema({
  upperCode: {
    type: String,
    label: 'Upper Code'
  },
  areas: {
    type: [String],
    label: 'Areas Code'
  }
});
ProfileSchema = new SimpleSchema({
  name:{
    type: String,
    label: 'User name',
    max: 20
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
  degree: {
    type: String,
    label: 'Highest Degree',
    optional: true
  },
  college: {
    type: String,
    label: 'College',
    optional: true
  },
  company: { // 所在机构
    type: String,
    label: 'Company',
    optional: true
  },
  selfIntro: {
    type: String,
    optional: true,
    label: 'Self intro',
    max: 500
  },
  subjects: {
    optional: true,
    type: [UserSubjectsSchema]
  },
  prices: { // 课时单价
    type: [_subjectPriceSchema],
    label: 'Price of each subject',
    optional: true
  },
  address: {
    optional: true,
    type: UserAddressSchema
  },
  teachingAge: {
    type: String,
    optional: true,
    label: "Teaching Age"
  },
  recommend: {
    type: Boolean,
    optional: true,
    label: 'Recommend'
  },
  location: {
    optional: true,
    type: UserLocationSchema
  },
  studyCenters: {
    type: [String],
    optional: true,
    label: 'Study center'
  },
  recommendAvatarUrl: {
    type: String,
    optional: true,
    label: 'Recommend avatar url'
  },
  teacherType: {
    type: String,
    optional: true,
    allowedValues: ['goHome', 'studyCenter'],
    label: 'Teacher type'
  },
  price: {
    type: Number,
    decimal: true,
    optional: true,
    label: 'Price'
  },
  maScore: {
    type: Number,
    optional: true,
    label: 'Ma Du score'
  },
  maCount: {
    type: Number,
    optional: true,
    label: 'Ma Du count'
  },
  laScore: {
    type: Number,
    optional: true,
    label: 'La Du score'
  },
  laCount: {
    type: Number,
    optional: true,
    label: 'La Du count'
  },
  serviceArea: {
    type: serviceAreaSchema,
    optional: true,
    label: 'Go home area'
  },
  school: { // 所在学校，家长端
    type: String,
    optional: true,
    label: 'School Name'
  },
  grade: { // 就读年级，家长端
    type: String,
    optional: true,
    label: 'Grade'
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
  updateProfile: function(userId, profile) {
    check(userId, String);
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

    var oldUser = Meteor.users.findOne({_id: userId});
    if (oldUser) {
      profile = _.extend(oldUser.profile, profile);
    }

    var curUser = Meteor.user();
    if (!curUser || !(curUser.role === 'admin') && !(Meteor.userId() === userId)) {
      //user can only update self without admin role
      throw new Meteor.Error('权限不足', "当前用户权限不足");
    }

    var returnPage = 'profileEditEdu';
    if (curUser.role === 'admin') {
      returnPage = 'adminUsers';
    }
    // console.log(profile);
    var setObj = {profile:profile};
    if (Meteor.user().role=='teacher') {// teachers need to audit
      var now = Date.now();
      TeacherAudit.update({userId:Meteor.userId()},{$set:{name:profile.name,submitTime:now,basicInfo:{submitTime:now, status: 'submited'}}},{upsert:true});
      setObj["status.basic"] = "submited";
    }
    Meteor.users.update({_id: userId}, {$set: setObj});
    // TODO：用户操作日志 UserOpLogs
    // UserOpLogs ...
    return {goPage: returnPage};
  },
  submitApplyProfile: function(profile) {
    if (!Meteor.user() || Meteor.user().role!=='teacher') {
      throw new Meteor.Error('权限不足', "当前用户权限不足");
    }
    var userId = Meteor.userId();
    var oldProfile = Meteor.user().profile;
    if (oldProfile) {
      profile = _.extend(oldProfile, profile);
    }
    var now = Date.now();
    Meteor.users.update({_id: userId}, {$set: {'profile': profile, "status.basic": "submited"}});
    TeacherAudit.update({userId:Meteor.userId()},{$set:{name:profile.name,submitTime:now,basicInfo:{submitTime:now, status: 'submited'}}},{upsert:true});
    return true;
  },
  updateServiceArea: function(serviceArea) {
    if (!Meteor.user() || Meteor.user().role!=='teacher') {
      throw new Meteor.Error('权限不足', "当前用户权限不足");
    }
    if (!serviceArea) {
      throw new Meteor.Error('参数错误', "参数错误");
    }
    var userId = Meteor.userId(), user = Meteor.user();
    if (user && user.profile && user.profile.serviceArea) {
      if (_.isEqual(serviceArea, user.profile.serviceArea)) {
        return true;
      }
    }
    Meteor.users.update({_id: userId}, {$set: {'profile.serviceArea': serviceArea}});
    return true;
  }
});
