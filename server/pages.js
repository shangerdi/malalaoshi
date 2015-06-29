Meteor.methods({
  updatePage: function(page) {
    check(page, {
      editorTextArea: String,
      name: String,
      title: String
    });

    var errors = validatePage(page);
    if (!!errors.hasError) {
      throw new Meteor.Error('无效设置', "参数设置错误");
    }

    var curUser = Meteor.user();
    if (!curUser || !(curUser.role === 'admin')){
        throw new Meteor.Error('权限不足', "当前用户权限不足");
    }
	var updatePage = _.extend(page, {
	  userId: curUser._id,
	  submitted: new Date()
	});

    var oldPage = Pages.findOne({name: page.name});
    if (oldPage) {
        Pages.update({name: page.name}, {$set: updatePage});
    }else{
        Pages.insert(page);
    }

    return page.name;
  }
});
