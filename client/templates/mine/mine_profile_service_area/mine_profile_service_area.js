var saveProfileServiceArea = function(e) {
  var upperCode = getUpperCode();
  var $areas = $(".area"), a = [];
  $areas.each(function(){
    $this = $(this);
    if ($this.is(".selected")) {
      a.push($this.attr('code'));
    }
  });
  if (a.length==0) {
    alert("请选择区域！");
    return;
  }
  var obj = {'upperCode': upperCode, 'areas': a};
  Meteor.call('updateServiceArea', obj, function(err, result){
    if (err) {
      alert(err.reason);
      return;
    }
    Router.go('mineProfile');
  });
}
var getUpperCode = function() {
  var code = Router.current().params.query.code;
  if (!code) {
    var user = Meteor.user();
    if (user && user.profile && user.profile.serviceArea) {
      code = serviceArea.upperCode;
    }
  }
  return code;
}
Template.mineProfileServiceArea.onCreated(function(){
  var code = getUpperCode();
  if (!code) {
    Router.go('mineProfileServiceAreaList');
    return;
  }
  this.upperCode = code;
  Meteor.subscribe('areasByParent', code);
});
Template.mineProfileServiceArea.onRendered(function(){
  $("[data-action=save-profile-serviceArea]").click(saveProfileServiceArea);
});
Template.mineProfileServiceArea.helpers({
  'parentArea': function() {
    var code = Template.instance().upperCode;
    return Areas.findOne({'code': code});
  },
  'areaList': function() {
    var code = Template.instance().upperCode;
    var theArea = Areas.findOne({'code': code});
    if (!theArea) {
      return;
    }
    var subAreas = Areas.find({"parentCode":code}, {sort: {code: 1}}).fetch();
    var a = [];
    theArea.name = '全市';
    theArea.all = 'all';
    a.push(theArea);
    a = a.concat(subAreas);
    // check each one is selected
    var user = Meteor.user();
    if (user && user.profile && user.profile.serviceArea) {
      var oldAreas = user.profile.serviceArea.areas;
      if (_.isEmpty(oldAreas)) {
        return a;
      }
      _.each(a, function(obj) {
        var tmp = obj.code;
        if(_.contains(oldAreas, tmp)) {
          obj.selected = 'selected';
        }
      });
    }
    return a;
  }
});
Template.mineProfileServiceArea.events({
  'click .parent-area': function (e) {
    var code = Template.instance().upperCode;
    var area = Areas.findOne({'code': code}), query = {};
    if (area.parentCode) {
      query = {'code': area.parentCode};
    }
    Router.go("mineProfileServiceAreaList", {}, {'query': query});
  },
  'click .area': function (e) {
    var ele=e.target, $ele = $(ele);
    if ($ele.hasClass('all')) {
      $('.area').removeClass('selected');
      $ele.addClass('selected')
    } else {
      $('.area.all').removeClass('selected');
      $ele.toggleClass('selected');
    }
  }
});
