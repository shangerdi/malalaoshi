Template.mineProfileParent.helpers({
  getBirthDayStr: function() {
    var birthday = Meteor.user().profile.birthday;
    if (birthday) {
      var a = birthday.split('-'), year = a[0], month = a[1], day = a[2];
      return moment([year,month-1,day]).format('YYYY年M月D日');
    }
    return '未设置';
  },
  getGradeStr: function() {
    var grade = Meteor.user().profile.grade;
    if (grade) {
      return getEduGradeText(grade);
    }
    return '未设置';
  }
});
Template.mineProfileParent.events({
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
  'click #mineProfileAvatar': function(e) {
    if (Meteor.isCordova) {
      appUploadUserAvatarListener(e);
    } else {
      Router.go('mineProfileAvatar');
    }
  }
});
