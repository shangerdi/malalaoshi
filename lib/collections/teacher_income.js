TeacherIncome = new Mongo.Collection('teacherIncome');

var bankCardsSchema = new SimpleSchema({
  cardNumber: {
    type: Number,
    label: 'Bank Card Number'
  }
});

TeacherIncomeSchema = new SimpleSchema({
  userId:{
    type: String,
    label: 'Teacher Id'
  },
  income:{
    type: Number,
    label: 'Teacher income(balance)',
  },
  withdrawPass:{
    type: String,
    label: 'Withdraw Password',
  },
  bankCards:[bankCardsSchema]
});

TeacherIncome.attachSchema(TeacherIncomeSchema);

/*
Todo:
1. Withdraw Password is only used in backend, should it been placed here?
2. The BankCards may need something else.
*/