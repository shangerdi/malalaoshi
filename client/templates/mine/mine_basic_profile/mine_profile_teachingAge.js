var saveProfileTeachingAge = function(e) {
  var teachingAge = $("input[name=teachingAge]:checked").val();
  if (!teachingAge) {
    alert("不能为空！");
    return;
  }
  if (teachingAge!==Meteor.user().profile.teachingAge) {
    Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.teachingAge':teachingAge}});
  }
  if (Meteor.isCordova) {
    navigator.app && navigator.app.backHistory && navigator.app.backHistory();
  } else {
    history.back();
  }
}
Template.mineProfileTeachingAge.onRendered(function(){
  $("[data-action=save-profile-teachingAge]").click(saveProfileTeachingAge);
  var teachingAge = Meteor.user().profile.teachingAge;
  if (teachingAge) {
    $("input[name=teachingAge]").each(function(){
      if(this.value==teachingAge) {
        this.checked = true;
        return false;//end each loop
      }
    });
  }
});
Template.mineProfileTeachingAge.helpers({
  teachingAgeList: function() {
    var a=[];
    for (i=1;i<=20;i++) {
      a.push({'key': i, 'text': i+'年'});
    }
    a.push({'key': '20+', 'text': '20年以上'});
    return a;
  }
});
Template.mineProfileTeachingAge.events({
  'click .item-radio': function(e) {
    var ele = e.target, $ele = $(ele).closest(".item-radio");
    $ele.find("input")[0].click();
  }
});