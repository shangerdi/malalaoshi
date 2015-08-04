Template.parentSettingsEdit.events({
  'click .ion-ios-close-empty': function(e) {
    $("#name").val('');
  },
  'click .btn-save': function(e) {
    var newname = $("#name").val();
    if (!newname) {
      alert("不能为空！");
    }
    newname=$.trim(newname);
    if (newname!==Meteor.user().profile.name) {
      Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.name':newname}});
    }
    if (Meteor.isCordova) {
      Router.go('parentSettings');
    } else {
      Router.go('parentDashboard');
    }
  }
});