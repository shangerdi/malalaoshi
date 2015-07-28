Pages = new Mongo.Collection('pages');

Pages.attachSchema(new SimpleSchema({
  name: {
    type: String,
    label: 'content name'
  },
  editorTextArea:{
    type: String,
    label: 'text'
  },
  title: {
    type: String,
    label: 'title'
  },
  userId: {
    type: String,
    label: 'Submit User Id',
    optional: true,
    autoValue: function() {
      if(this.isInsert || this.isUpsert){
        return this.userId;
      }
    }
  },
  submitted: {
    type: Number,
    label: 'last submit',
    autoValue: function() {
      if(this.isInsert || this.isUpsert){
        return Date.now();
      }
    }
  }
}));


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
