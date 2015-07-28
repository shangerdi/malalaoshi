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
