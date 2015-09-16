var saveProfileSchool = function(e) {
  var newschool = $("#school").val();

  newschool=$.trim(newschool);
  if (newschool!==Meteor.user().profile.school) {
    Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.school':newschool}});
  }
  if (Meteor.isCordova) {
    navigator.app && navigator.app.backHistory && navigator.app.backHistory();
  } else {
    history.back();
  }
}
Template.mineProfileSchool.onRendered(function(){
  $("[data-action=save-profile-school]").click(saveProfileSchool);
});
Template.mineProfileSchool.events({
  'click .ion-ios-close-empty': function(e) {
    $("#school").val('');
  }
});