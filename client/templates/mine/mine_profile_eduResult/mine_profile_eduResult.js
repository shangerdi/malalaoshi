var saveProfileEduResult = function(e) {
  var title = $("#title").val();
  var doneDate = $("#doneDate").val();
  var content = $("#content").val();
  if (!title || !doneDate || !content) {
    alert("请确保各项内容填写正确！");
    return;
  }
  var id = Router.current().params.id;
  var expObj = {'id': id, 'title': title, 'doneDate': doneDate, 'content': content};
  Meteor.call('updateEduResult', expObj, function(err, result){
    if (err) {
      alert(err.reason);
      return;
    }

    if (Meteor.isCordova) {
      navigator.app && navigator.app.backHistory && navigator.app.backHistory();
    } else {
      history.back();
    }
  });
}
Template.mineProfileEduResult.onRendered(function(){
  $("[data-action=save-profile-eduResult]").click(saveProfileEduResult);
  var obj = Router.current().params.query;
  if (obj) {
    $("#title").val(obj.title);
    $("#doneDate").val(obj.doneDate);
    $("#content").val(obj.content);
  }
});
Template.mineProfileEduResult.events({
  'click .ion-ios-close-empty': function(e) {
    $("#eduResult").val('');
  }
});