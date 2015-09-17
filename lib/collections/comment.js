Comments = new Mongo.Collection('comments');

var _simpleTeacherSchema = new SimpleSchema({
  id:{
    type: String,
    label: 'Teacher Id',
    index: true
  },
  name:{
    type: String,
    label: 'Teacher Name',
    optional: true
  }
});
var _simpleStudentSchema = new SimpleSchema({
  id:{
    type: String,
    label: 'Student Id',
    index: true
  },
  name:{
    type: String,
    label: 'Student Name',
    optional: true
  }
});
Comments.attachSchema(new SimpleSchema({
  teacher: {
    type: _simpleTeacherSchema
  },
  student: {
    type: _simpleStudentSchema
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
