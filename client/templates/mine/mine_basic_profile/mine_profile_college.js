var saveProfileCollege = function(e) {
  var newcollege = $("#college").val();
  if (!newcollege) {
    alert("不能为空！");
    return;
  }
  newcollege=$.trim(newcollege);
  if (newcollege!==Meteor.user().profile.college) {
    Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.college':newcollege}});
  }
  if (Meteor.isCordova) {
    navigator.app && navigator.app.backHistory && navigator.app.backHistory();
  } else {
    history.back();
  }
}
Template.mineProfileCollege.onRendered(function(){
  $("[data-action=save-profile-college]").click(saveProfileCollege);
});
Template.mineProfileCollege.events({
  'click .ion-ios-close-empty': function(e) {
    $("#college").val('');
  }
});