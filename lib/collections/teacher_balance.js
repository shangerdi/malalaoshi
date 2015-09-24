TeacherBalance = new Mongo.Collection('teacherBalance');

var bankCardsSchema = new SimpleSchema({
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
    label: 'Teacher account balance in RMB'
  },
  withdrawPass:{
    type: String,
    label: 'Withdraw Password(Encrypted Password, do not publish to client)'
  },
  bankCards:{
    type:[bankCardsSchema]
  }
});

TeacherBalance.attachSchema(TeacherBalanceSchema);

/*
Todo:
1. The BankCards may need something else.
*/