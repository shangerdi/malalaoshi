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
  }
});
