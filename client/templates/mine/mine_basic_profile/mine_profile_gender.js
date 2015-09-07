var saveProfileGender = function(e) {
  var gender = $("input[name=gender]:checked").val();
  if (!gender) {
    alert("不能为空！");
    return;
  }
  if (gender!==Meteor.user().profile.gender) {
    Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.gender':gender}});
  }
  if (Meteor.isCordova) {
    navigator.app && navigator.app.backHistory && navigator.app.backHistory();
  } else {
    history.back();
  }
}
Template.mineProfileGender.onRendered(function(){
  $("[data-action=save-profile-gender]").click(saveProfileGender);
  var gender = Meteor.user().profile.gender;
  if (gender) {
    $("input[name=gender][value="+gender+"]").attr("checked", true);
  }
});
Template.mineProfileGender.events({
  'click .item-radio': function(e) {
    var ele = e.target, $ele = $(ele).closest(".item-radio");
    $ele.find("input")[0].click();
  }
});