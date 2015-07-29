Meteor.methods({
  updatePage: function(page) {
    check(page, {
      content: String,
      name: String,
      title: String
    });

    var curUser = Meteor.user();
    if (!curUser || !(curUser.role === 'admin')){
        throw new Meteor.Error('权限不足', "当前用户权限不足");
    }

    Pages.update({name: page.name}, {$set: page}, {upsert: true});

    return page.name;
  }
});
