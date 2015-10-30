TeacherWithdraw = new Mongo.Collection('teacherWithdraw');

TeacherWithdrawSchema = new SimpleSchema({
  userId:{
    type: String,
    label: 'Teacher Id',
    index: true
  },
  amount:{
    type: Number,
    label: 'Amount of the money(fen) in this transaction'
  },
  cardNumber:{
    type: String,
    label: 'Bankcard Account Number'
  },
  cardUserName:{
    type: String,
    label: 'Bankcard Account Name'
  },
  bankName:{
    type: String,
    label: 'Bank Name'
  },
  createdAt:{
    type: Number,
    label: 'Created At',
    autoValue: function() {
      if (this.isInsert) {
        return Date.now();
      }
    }
  }
});

TeacherWithdraw.attachSchema(TeacherWithdrawSchema);
