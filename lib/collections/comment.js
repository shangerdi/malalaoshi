Comment = new Mongo.Collection('Comment');

Comment.attachSchema(new SimpleSchema({
  id:{
    type: String,
    label: 'Comment Id'
  },
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
  }
}));
