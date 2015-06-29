Pages = new Mongo.Collection('Pages');

Pages.allow({
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

validatePage = function (page) {
  var errors = {}, hasError = false;
  if (!page.editorTextArea) {
    errors.editorTextArea = '请输正文内容';
    hasError = true;
  }
  if (!page.pageName) {
    errors.pageName = '请输栏目名称';
    hasError = true;
  }

  if (!page.pageCode) {
    errors.pageCode = '栏目ID不能为空';
    hasError = true;
  }
  errors.hasError = hasError;
  return errors;
}

