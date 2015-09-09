var saveProfileCompany = function(e) {
  var newcompany = $("#company").val();
  if (!newcompany) {
    alert("不能为空！");
    return;
  }
  newcompany=$.trim(newcompany);
  if (newcompany!==Meteor.user().profile.company) {
    Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.company':newcompany}});
  }
  if (Meteor.isCordova) {
    navigator.app && navigator.app.backHistory && navigator.app.backHistory();
  } else {
    history.back();
  }
}
Template.mineProfileCompany.onRendered(function(){
  $("[data-action=save-profile-company]").click(saveProfileCompany);
});
Template.mineProfileCompany.events({
  'click .ion-ios-close-empty': function(e) {
    $("#company").val('');
  }
});