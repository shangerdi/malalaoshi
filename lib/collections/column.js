Column = new Mongo.Collection('column');

Column.allow({
  update: function(userId, post) {
    return !! userId;
  },
  remove: function(userId, post) {
    return !! userId;
  },
  insert: function(userId, post) {
    return !! userId;
  }
});

validateColumn = function (column) {
  var errors = {}, hasError = false;
  if (!column.editorTextArea) {
    errors.editorTextArea = '请输正文内容';
    hasError = true;
  }
  if (!column.columnName) {
    errors.columnName = '请输栏目名称';
    hasError = true;
  }

  if (!column.columnId) {
    errors.columnId = '栏目ID不能为空';
    hasError = true;
  }
  errors.hasError = hasError;
  return errors;
}
Meteor.methods({
  updateColumn: function(column) {
    check(column, {
      editorTextArea: String,
      columnName: String,
      columnId: String
    });

    var errors = validateColumn(column);
    if (!!errors.hasError) {
      throw new Meteor.Error('无效设置', "参数设置错误");
    }

    var curUser = Meteor.user();
    if (!curUser || !(curUser.role === 'admin')){
        throw new Meteor.Error('权限不足', "当前用户权限不足");
    }
	var updateColumn = _.extend(column, {
	  userId: curUser._id,
	  submitted: new Date()
	});

    var oldColumn = Column.findOne({columnId: column.columnId});
    if (oldColumn) {
      console.log(".............更新。。。。。。。。。。");
        //Column.update({_id: column.columnId}, {$set:{editorTextArea:column.editorTextArea,columnName:column.columnName}});
        Column.update({_id: oldColumn._id}, {$set: updateColumn});
    }else{
      console.log(".............插入。。。。。。。。。。");
        column._id = Column.insert(column);
    }

    return column.columnId;
  }
});
