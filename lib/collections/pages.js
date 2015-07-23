Pages = new Mongo.Collection('pages');

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
