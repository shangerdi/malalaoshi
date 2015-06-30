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
