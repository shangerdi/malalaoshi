Users = new Mongo.Collection('posts');
validateProfile = function (profile) {
  var errors = {};
  if (!profile.name) {
    errors.name = '请输入名字';
  }
  return errors;
}
Meteor.methods({
  updateProfile: function(profile) {
    check(profile, {
      name: String
    });

    var errors = validateProfile(profile);
    if (errors.name)
      throw new Meteor.Error('无效设置', "参数设置错误");

    console.log(profile);
    console.log(Meteor.user()._id);
    Users.update({_id: Meteor.user()._id}, {$set:{profile:profile}});
  }
});
