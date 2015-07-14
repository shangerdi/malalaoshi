Orders = new Mongo.Collection('orders');

OrdersTeacherSchema = new SimpleSchema({
  id:{
    type: String,
    label: 'Teacher Id'
  },
  name:{
    type: String,
    label: 'Teacher Name'
  }
});
OrdersStudentSchema = new SimpleSchema({
  id:{
    type: String,
    label: 'Student Id'
  },
  phoneNo:{
    type: String,
    label: 'Student PhoneNo'
  },
  name:{
    type: String,
    label: 'Student Name'
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
    label: 'Class Name'
  },
  subject:{
    type: String,
    label: 'Teacher Subject'
  },
  hour: {
    type: Number,
    decimal: true,
    label: 'Hour'
  },
  unitCost: {
    type: Number,
    decimal: true,
    label: 'Unit Cost'
  },
  cost: {
    type: Number,
    decimal: true,
    label: 'Cost'
  },
  status: {
    type: String,
    label: 'status',
    allowedValues: ['submited', 'paid', 'deleted'],
    defaultValue: 'submited'
  },
  submitUserId: {
    type: String,
    label: 'Submit User Id'
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
