Template.mineProfile.onCreated(function(){
  var user = Meteor.user();
  if (user && user.profile && user.profile.serviceArea) {
    var serviceArea = user.profile.serviceArea, areaCodes = [];
    if (serviceArea.upperCode) {
      areaCodes.push(serviceArea.upperCode);
    }
    if (!_.isEmpty(serviceArea.areas)) {
      areaCodes = areaCodes.concat(serviceArea.areas);
    }
    Meteor.subscribe('areas', areaCodes);
  }
});
Template.mineProfile.helpers({
  getBirthDayStr: function() {
    var birthday = Meteor.user().profile.birthday;
    if (birthday) {
      var a = birthday.split('-'), year = a[0], month = a[1], day = a[2];
      return moment([year,month-1,day]).format('YYYY年M月D日');
    }
    return '';
  },
  getDegreeStr: function() {
    var degree = Meteor.user().profile.degree;
    if (degree) {
      return getEduDegreeText(degree);
    }
    return '';
  },
  getTeachingAgeStr: function() {
    var teachingAge = Meteor.user().profile.teachingAge;
    if (teachingAge) {
      var s = parseInt(teachingAge)+'年';
      if ((''+teachingAge).indexOf('+')>0) {
        s += '以上';
      }
      return s;
    } else {
      return '未设置';
    }
  },
  getServiceAreaNames: function() {
    var user = Meteor.user();
    if (user && user.profile && user.profile.serviceArea) {
      var serviceArea = user.profile.serviceArea, parentArea = null;
      if (serviceArea.upperCode) {
        parentArea = Areas.findOne({'code': serviceArea.upperCode});
      }
      if (!parentArea) {
        return;
      }
      if (_.isEmpty(serviceArea.areas) || serviceArea.areas[0]==serviceArea.upperCode) {
        return parentArea.name;
      }
      var areas = Areas.find({'code': {$in: serviceArea.areas}}).fetch();
      var names = "";
      _.each(areas, function(obj) {
        names += obj.name + "  ";
      });
      return names;
    }
  }
});
Template.mineProfile.events({
  'click #teachingLocationItem': function(e) {
    mapCallbackFunction = function() {
      var point = Session.get('locationLngLat');
      var title = Session.get('locationAddress');
      var address = Session.get("locationStreet");
      var newLocation = {'lng': point.lng, 'lat': point.lat, 'title': title, 'address': address};

      if (!_.isEqual(newLocation,Meteor.user().profile.location)) {
        Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.location':newLocation}});
      }
      if (Meteor.isCordova) {
        navigator.app && navigator.app.backHistory && navigator.app.backHistory();
      } else {
        history.back();
      }
    }
    Router.go('map');
  },
  'click #mineProfileServiceArea': function(e) {
    var user = Meteor.user();
    if (user && user.profile && user.profile.serviceArea) {
      var serviceArea = user.profile.serviceArea;
      if (serviceArea.upperCode) {
        Router.go("mineProfileServiceArea", {}, {'query': {'code': serviceArea.upperCode}});
        return;
      }
    }
    Router.go("mineProfileServiceAreaList");
  }
});