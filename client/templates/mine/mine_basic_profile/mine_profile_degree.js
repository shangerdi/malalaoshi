var saveProfileDegree = function(e) {
  var degree = $("input[name=degree]:checked").val();
  if (!degree) {
    alert("不能为空！");
    return;
  }
  if (degree!==Meteor.user().profile.degree) {
    Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.degree':degree}});
  }
  if (Meteor.isCordova) {
    navigator.app && navigator.app.backHistory && navigator.app.backHistory();
  } else {
    history.back();
  }
}
Template.mineProfileDegree.onRendered(function(){
  $("[data-action=save-profile-degree]").click(saveProfileDegree);
  var degree = Meteor.user().profile.degree;
  if (degree) {
    $("input[name=degree][value="+degree+"]").attr("checked", true);
  }
});
Template.mineProfileDegree.helpers({
  degreeList: function() {
    return getEduDegreeList();
  }
});
Template.mineProfileDegree.events({
  'click .item-radio': function(e) {
    var ele = e.target, $ele = $(ele).closest(".item-radio");
    $ele.find("input")[0].click();
  }
});