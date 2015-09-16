Template.mineProfileServiceAreaList.onCreated(function(){
  var code = Router.current().params.query.code;
  Meteor.subscribe('areasByParent', code);
});
Template.mineProfileServiceAreaList.helpers({
  'parentArea': function() {
    var code = Router.current().params.query.code;
    if (code) {
      return Areas.findOne({'code': code});
    }
  },
  'areaList': function() {
    var code = Router.current().params.query.code;
    if (!code) return Areas.find({"level":1}, {sort: {code: 1}});
    return Areas.find({"parentCode":code}, {sort: {code: 1}});
  }
});
Template.mineProfileServiceAreaList.events({
  'click .parent-area': function (e) {
    var ele=e.target, id = ele.id;
    var area = Areas.findOne({_id:id}), query = {};
    if (area.parentCode) {
      query = {'code': area.parentCode};
    }
    Meteor.subscribe('areasByParent', area.parentCode, function(){
      Router.go("mineProfileServiceAreaList", {}, {'query': query});
    });
  },
  'click .area': function (e) {
    var ele=e.target, id = ele.id;
    var area = Areas.findOne({_id:id});
    if (area.depth > 2) {
      Meteor.subscribe('areasByParent', area.code, function(){
        Router.go("mineProfileServiceAreaList", {}, {'query': {'code': area.code}});
      });
    } else {
      Router.go("mineProfileServiceArea", {}, {'query': {'code': area.code}});
    }
  }
});
