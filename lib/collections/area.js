Areas = new Mongo.Collection("area");

Areas.attachSchema(new SimpleSchema({
  code: {
    type: String,
    label: 'Area Code',
    index: true
  },
  name: {
    type: String,
    label: 'Name'
  },
  level: {
    type: Number,
    label: 'Level'
  },
  parentCode: {
    type: String,
    label: 'Parent Code',
    index: true,
    optional: true
  },
  depth: {
    type: Number,
    label: 'Height in Area tree',
    optional: true
  }
}));

Meteor.methods({
  findArea: function(code) {
    return Areas.findOne({"code":code});
  },
  getProvince: function() {
    return Areas.find({"level":1}, {sort: {code: 1}}).fetch();
  },
  getSubAreas: function(code) {
    if (!code) return;
    return Areas.find({"parentCode": code}, {sort: {code: 1}}).fetch();
  }
});