var saveProfileGrade = function(e) {
  var grade = $("input[name=grade]:checked").val();

  if (grade!==Meteor.user().profile.grade) {
    Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.grade':grade}});
  }
  if (Meteor.isCordova) {
    navigator.app && navigator.app.backHistory && navigator.app.backHistory();
  } else {
    history.back();
  }
}
var getEduGradeList = function() {
  var dict = getEduGradeDict();
  var a = [];
  _.each(dict, function(obj){
    a.push({key:obj.key, text:obj.text});
  });
  return a;
}
Template.mineProfileGrade.onRendered(function(){
  $("[data-action=save-profile-grade]").click(saveProfileGrade);
  var grade = Meteor.user().profile.grade;
  if (grade) {
    $("input[name=grade][value="+grade+"]").attr("checked", true);
  }
});
Template.mineProfileGrade.helpers({
  gradeList: function() {
    return getEduGradeList();
  }
});
Template.mineProfileGrade.events({
  'click .item-radio': function(e) {
    var ele = e.target, $ele = $(ele).closest(".item-radio");
    $ele.find("input")[0].click();
  }
});