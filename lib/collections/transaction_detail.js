TransactionDetail = new Mongo.Collection('transactionDetail');

var OperatorSchema = new SimpleSchema({
  id:{
    type: String,
    label: 'Operator Id'
  },
  role:{
    type: String,
    label: 'Operator Role'
  }
});

TransactionDetailSchema = new SimpleSchema({
  userId:{
    type: String,
    label: 'Teacher Id'
  },
  courseId:{
    type: String,
    label: 'Which Course does this transaction belong to'
  },
  operator:{
    type: OperatorSchema
  },
  amount:{
    type: Number,
    label: 'Amount of the money in this transaction'
  },
  title:{
    type: String,
    label: 'Transaction title'
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

TransactionDetail.attachSchema(TransactionDetailSchema);
