var saveProfileName = function(e) {
  var newname = $("#name").val();
  if (!newname) {
    alert("不能为空！");
    return;
  }
  newname=$.trim(newname);
  if (newname!==Meteor.user().profile.name) {
    Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.name':newname}});
  }
  if (Meteor.isCordova) {
    navigator.app && navigator.app.backHistory && navigator.app.backHistory();
  } else {
    history.back();
  }
}
Template.mineProfileName.onRendered(function(){
  $("[data-action=save-profile-name]").click(saveProfileName);
});
Template.mineProfileName.events({
  'click .ion-ios-close-empty': function(e) {
    $("#name").val('');
  }
});