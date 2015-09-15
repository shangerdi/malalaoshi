TransactionDetail = new Mongo.Collection('transactionDetail');

TransactionDetailSchema = new SimpleSchema({
  userId:{
    type: String,
    label: 'Teacher Id'
  },
  parentId:{
    type: String,
    label: 'Which Parent Id From'
  },
  courseId:{
    type: String,
    label: 'Which Course does this transaction belong to'
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

/*
 Todo:
 1. Using a string title or a type?
 2. The parentId and courseId are not sure if used.
 */
