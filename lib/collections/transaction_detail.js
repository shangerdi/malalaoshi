TransactionDetail = new Mongo.Collection('transactionDetail');

var OperatorSchema = new SimpleSchema({
  // The id will be empty if the role == 'system'
  id:{
    type: String,
    label: 'Operator Id',
    optional: true
  },
  role:{
    type: String,
    label: 'Operator Role',
    allowedValues: ['system', 'admin', 'manager', 'teacher', 'student', 'parent']
  }
});

TransactionDetailSchema = new SimpleSchema({
  userId:{
    type: String,
    label: 'Teacher Id',
    index: true
  },
  courseId:{
    type: String,
    label: 'Which Course does this transaction belong to',
    optional: true
  },
  operator:{
    type: OperatorSchema
  },
  amount:{
    type: Number,
    label: 'Amount of the money(cents) in this transaction'
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
