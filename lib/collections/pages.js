Pages = new Mongo.Collection('pages');

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
  if (!page.title) {
    errors.title = '请输栏目名称';
    hasError = true;
  }

  if (!page.name) {
    errors.name = '栏目ID不能为空';
    hasError = true;
  }
  errors.hasError = hasError;
  return errors;
}
