Areas = new Mongo.Collection("area");

Meteor.methods({
  findArea: function(code) {
    return Areas.findOne({"code":code});
  },
  getProvince: function() {
    return Areas.find({"level":1}, {sort: {code: 1}}).fetch();
  },
  getSubAreas: function(code) {
    var theArea = Areas.findOne({"code":code});
    if (!theArea) {
      return;
    }
    if (theArea.level == 1) {
      return Areas.find({"level":2,"code":{$regex: '^'+theArea.code.substr(0,2)+'.*$'}}, {sort: {code: 1}}).fetch();
    } else if (theArea.level == 2) {
      return Areas.find({"level":3,"code":{$regex: '^'+theArea.code.substr(0,4)+'.*$'}}, {sort: {code: 1}}).fetch();
    }
    return theArea;
  }
});