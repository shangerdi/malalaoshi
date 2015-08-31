Comment = new Mongo.Collection('comment');

Comment.attachSchema(new SimpleSchema({
  courseAttendanceId:{
    type: String,
    label: 'CourseAttendance id'
  },
  maScore: {
    type: Number,
    label: 'Ma Du score'
  },
  laScore: {
    type: Number,
    label: 'La Du score'
  },
  comment: {
    type: String,
    label: 'Comment'
  },
  createdAt: {
    type: Number,
    label: 'Created at',
    autoValue: function() {
      if(this.isInsert || this.isUpsert){
        return Date.now();
      }
    }
  }
}));
