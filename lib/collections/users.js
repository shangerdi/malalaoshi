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
Meteor.methods({
  updateProfile: function(profile) {
    check(profile, {
      headImgUrl: String,
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

    console.log(profile);
    console.log(Meteor.userId());
    Meteor.users.update({_id: Meteor.userId()}, {$set:{profile:profile}});
  }
});
