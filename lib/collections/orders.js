Orders = new Mongo.Collection('orders');

var OrdersTeacherSchema = new SimpleSchema({
  id:{
    type: String,
    label: 'Teacher Id'
  },
  name:{
    type: String,
    label: 'Teacher Name'
  }
});
var OrdersStudentSchema = new SimpleSchema({
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

var _schedulePhaseSchema = new SimpleSchema({
  weekday: {
    type: Number,
    label: "Day number in week",
    min: 1,
    max: 7
  },
  start:{
    type: Number,
    label: "The minute to start",
    min: 0,
    max: 1440
  },
  end:{
    type: Number,
    label: "The minute to end",
    min: 0,
    max: 1440
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
    label: 'Subject'
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
  phases: {
    type: [_schedulePhaseSchema],
    optional: true
  },
  discount: { // TBD: id of coupons and sum of these
    type: Object,
    optional: true,
    blackbox: true
  },
  cost: {
    type: Number,
    decimal: true,
    label: 'Cost'
  },
  status: {
    type: String,
    label: 'status',
    allowedValues: ['submited', 'paid', 'deleted', 'end'],
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
  },
  chargeId: {
    type: String,
    label: 'Ping++ Charge ID',
    optional: true
  }
}));

Orders.getOrderPayAmount = function(order) {
  if (!order) {
    throw new Meteor.Error('Invalid Parameter', "计算订单支付金额参数错误！");
  }
  var discountSum = 0;
  if (order.discount && order.discount.sum) { // TODO
    discountSum = order.discount.sum;
  }
  return order.cost-discountSum;
}
