var saveProfileSubjects = function(e) {
  var subjects = Session.get('subjects');
  if (!subjects) {
    alert("不能为空！");
    return;
  }
  if (!_.isEqual(subjects,Meteor.user().profile.subjects)) {
    Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.subjects':subjects}});
  }
  if (Meteor.isCordova) {
    navigator.app && navigator.app.backHistory && navigator.app.backHistory();
  } else {
    history.back();
  }
}
Template.mineProfileSubjects.onRendered(function(){
  $("[data-action=save-profile-subjects]").click(saveProfileSubjects);
  var subjects = Meteor.user().profile.subjects;
  Session.set('subjects', subjects?subjects:[]);
});
