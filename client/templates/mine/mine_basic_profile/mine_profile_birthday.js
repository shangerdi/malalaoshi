var saveProfileBirthday = function(e) {
  var year = Session.get("curSwiperYear");
  var month = Session.get("curSwiperMonth");
  var day = Session.get("curSwiperDay");
  var momentObj = moment([year, month-1, day]);
  if (!momentObj.isValid() || !momentObj.isBefore(moment(new Date()))) {
    alert("选择出错，请重新选择");
    return;
  }
  var birthday = year+'-'+month+'-'+day;
  if (birthday!==Meteor.user().profile.birthday) {
    Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.birthday':birthday}});
  }
  if (Meteor.isCordova) {
    navigator.app && navigator.app.backHistory && navigator.app.backHistory();
  } else {
    history.back();
  }
}
Template.mineProfileBirthday.onCreated(function(){
  var birthday = Meteor.user().profile.birthday;
  if (birthday) {
    var a = birthday.split('-'), year = a[0], month = a[1], day = a[2];
    Session.set("curSwiperYear", year);
    Session.set("curSwiperMonth", month);
    Session.set("curSwiperDay", day);
  }
});
Template.mineProfileBirthday.onRendered(function(){
  $("[data-action=save-profile-birthday]").click(saveProfileBirthday);
});
