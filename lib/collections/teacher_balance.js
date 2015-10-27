TeacherBalance = new Mongo.Collection('teacherBalance');

var bankCardsSchema = new SimpleSchema({
  cardUserName: {
    type: String,
    label: 'Bank Card User Name'
  },
  bankName: {
    type: String,
    label: 'Bank Name'
  },
  cardNumber: {
    type: String,
    label: 'Bank Card Number'
  }
});

TeacherBalanceSchema = new SimpleSchema({
  userId:{
    type: String,
    label: 'Teacher Id',
    index: true
  },
  balance:{
    type: Number,
    label: 'Teacher account balance in RMB',
    defaultValue: 0
  },
  withdrawPass:{
    type: String,
    label: 'Withdraw Password(do not publish to client)',
    optional: true
  },
  isSetPass:{
    type: Boolean,
    label: 'If the teacher has set withdraw password',
    defaultValue: false
  },
  token:{
    type: Number,
    decimal: true,
    label: 'Reset Password Token',
    optional: true
  },
  tryTimes:{
    type: Number,
    label: 'Password wrong times',
    defaultValue: 0
  },
  bankCards:{
    type:[bankCardsSchema]
  }
});

TeacherBalance.attachSchema(TeacherBalanceSchema);
