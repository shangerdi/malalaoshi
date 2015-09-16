var saveProfileSelfIntro = function(e) {
  var newselfIntro = $("#selfIntro").val();
  if (!newselfIntro) {
    alert("不能为空！");
    return;
  }
  newselfIntro=$.trim(newselfIntro);
  if (newselfIntro!==Meteor.user().profile.selfIntro) {
    Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.selfIntro':newselfIntro}});
  }
  if (Meteor.isCordova) {
    navigator.app && navigator.app.backHistory && navigator.app.backHistory();
  } else {
    history.back();
  }
}
Template.mineProfileSelfIntro.onRendered(function(){
  $("[data-action=save-profile-selfIntro]").click(saveProfileSelfIntro);
});
Template.mineProfileSelfIntro.events({
  'click .ion-ios-close-empty': function(e) {
    $("#selfIntro").val('');
  }
});