/**
 * 超级管理员用户{role: admin}   可以创建删除用户
 * 普通管理员用户{role: manager} 审查数据
 * 老师用户{role: teacher}       教师，审核认证后才可以被学生或家长看到
 * 学生{role: student}
 * 家长{role: parent}
 * ...
 */
validateProfile = function (profile) {
  var errors = {}, hasError = false;
  if (!profile.name) {
    errors.name = '请输入名字';
    hasError = true;
  }
  if (!profile.gender) {
    errors.gender = '请选择性别';
    hasError = true;
  }
  if (!profile.birthday) {
    errors.birthday = '请选择正确的出生日期';
    hasError = true;
  }
  if (!profile.state) {
    errors.state = '请选择目前身份';
    hasError = true;
  }
  if (!profile.college) {
    errors.college = '请填写毕业院校';
    hasError = true;
  }
  if (!profile.degree) {
    errors.degree = '请选择学历';
    hasError = true;
  }
  if (!profile.address || !profile.address.province) {// || !profile.address.city || !profile.address.district
    errors.address = '请确认所在区域';
    hasError = true;
  }
  if (!profile.selfIntro) {
    errors.selfIntro = '请输入个人简介';
    hasError = true;
  }
  errors.hasError = hasError;
  return errors;
}
getTeacherStateList = function() {
  return [{
    key:1,
    name: "在职教师",
    hint: "含公立学校和培训结构"
  },{
    key: 2,
    name: "准教师"
  }];
}
getTeacherStateText = function(v) {
  var arr = getTeacherStateList();
  var e = _.find(arr, function(obj){
    return obj.key==v;
  });
  if (e) {
    return e.name;
  }
  return null;
}
Meteor.methods({
  updateProfile: function(profile) {
    check(profile, {
      name: String,
      nickname: String,
      gender: String,
      birthday: String,
      state: String,
      college: String,
      degree: String,
      major: String,
      address: Object,
      selfIntro: String,
      motto: String
    });

    var errors = validateProfile(profile);
    if (!!errors.hasError) {
      throw new Meteor.Error('无效设置', "参数设置错误");
    }

    var oldProfile = Meteor.user().profile;
    if (oldProfile) {
      profile = _.extend(Meteor.user().profile, profile);
    }
    console.log(profile);
    console.log(Meteor.userId());
    Meteor.users.update({_id: Meteor.userId()}, {$set:{profile:profile}});
    var now = Date.now();
    TeacherAudit.update({userId:Meteor.userId()},{$set:{name:profile.name,submitTime:now,basicInfo:{submitTime:now, status: 'submited'}}},{upsert:true});
    // TODO：用户操作日志 UserOpLogs
  }
});
