Template.parentSettingsEdit.events({
  'click .btn-save': function(e) {
    var newname = $("#name").val();
    if (!newname) {
      alert("Please!");
    }
    newname=$.trim(newname);
    if (newname!==Meteor.user().profile.name) {
      Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.name':newname}});
    }
    Router.go('parentSettings');
  }
});