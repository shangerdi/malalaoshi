Pages = new Mongo.Collection('pages');

Pages.attachSchema(new SimpleSchema({
  name: {
    type: String,
    label: 'Page name'
  },
  content:{
    type: String,
    label: 'Content'
  },
  title: {
    type: String,
    label: 'Title'
  },
  userId: {
    type: String,
    label: 'Submit User Id',
    optional: true,
    autoValue: function() {
      if(this.isInsert || this.isUpsert || this.isUpdate){
        return this.userId;
      }
    }
  },
  submitted: {
    type: Number,
    label: 'Last submit',
    autoValue: function() {
      if(this.isInsert || this.isUpsert || this.isUpdate){
        return Date.now();
      }
    }
  }
}));


validatePage = function (page) {
  var errors = {}, hasError = false;
  if (!page.content) {
    errors.content = '请输正文内容';
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
