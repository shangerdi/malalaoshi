BankCardRules = new Mongo.Collection('bankCardRules');

BankCardRulesSchema = new SimpleSchema({
  orgCode:{
    type: String,
    label: 'organization code',
    optional: true
  },
  bankName:{
    type: String,
    label: 'bank name'
  },
  cardName:{
    type: String,
    label: 'card name',
    optional: true
  },
  cardType:{
    type: String,
    label: 'card type'
  },
  totalSize:{
    type: Number,
    label: 'total card number size'
  },
  binCodeSize:{
    type: Number,
    label: 'bin code size'
  },
  binCode:{
    type: String,
    label: 'bin code',
    index: true
  }
});

BankCardRules.attachSchema(BankCardRulesSchema);
