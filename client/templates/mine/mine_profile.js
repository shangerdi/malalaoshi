Template.mineProfile.helpers({
  getBirthDayStr: function() {
    var birthday = Meteor.user().profile.birthday;
    if (birthday) {
      var a = birthday.split('-'), year = a[0], month = a[1], day = a[2];
      return moment([year,month-1,day]).format('YYYY年M月D日');
    }
    return '';
  }
});
