Orders = new Mongo.Collection('orders');

OrdersTeacherSchema = new SimpleSchema({
  id:{
    type: String,
    label: 'TeacherId'
  },
  name:{
    type: String,
    label: 'TeacherName'
  },
  subject:{
    type: String,
    label: 'TeacherSubject'
  }
});
OrdersStudentSchema = new SimpleSchema({
  id:{
    type: String,
    label: 'StudentId'
  },
  phoneNo:{
    type: String,
    label: 'StudentPhoneNo'
  },
  name:{
    type: String,
    label: 'StudentName'
  }
});

Orders.attachSchema(new SimpleSchema({
  student: {
    type: OrdersStudentSchema
  },
  teacher: {
    type: OrdersTeacherSchema
  },
  className: {
    type: String,
    label: 'ClassName'
  },
  hour: {
    type: Number,
    decimal: true,
    label: 'Hour'
  },
  unitCost: {
    type: Number,
    decimal: true,
    label: 'UnitCost'
  },
  cost: {
    type: Number,
    decimal: true,
    label: 'Cost'
  },
  status: {
    type: String,
    label: 'status',
    defaultValue: 'submited'
  },
  submitUserId: {
    type: String,
    label: 'SubmitUserId'
  },
  createdAt: {
    type: Number,
    label: 'Created at',
    optional: true,
    autoValue: function() {
      if(this.isInsert || this.isUpsert){
        return Date.now();
      }
    }
  }
}));

Orders.allow({
  update: function(userId, post) {
    return !! userId && userId == post.student.id;
  },
  remove: function(userId, post) {
    return !! userId && userId == post.student.id;
  },
  insert: function(userId, post) {
    return !! userId && userId == post.student.id;
  }
});
