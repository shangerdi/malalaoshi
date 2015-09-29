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
var formatDate = function(datetime) {
  var momentObj = moment(parseInt(datetime));
  if (!momentObj.isValid()) {
    return datetime;
  }
  return momentObj.format('YYYY年M月D日')
}
Template.mineProfileEduResult.onRendered(function(){
  $("[data-action=save-profile-eduResult]").click(saveProfileEduResult);
  var obj = Router.current().params.query;
  if (obj) {
    $("#title").val(obj.title);
    $("#doneDate").val(obj.doneDate);
    $("#doneDateText").val(formatDate(obj.doneDate));
    $("#content").val(obj.content);
  }
});
Template.mineProfileEduResult.helpers({
  'getId': function() {
    return Router.current().params.id;
  }
});

Template.mineProfileEduResult.events({
  'click #doneDateText': function(e) {
    Session.set('dateSelectTargetId', 'doneDate');
    IonModal.open("_dateSelectModal", {'title': "时间"});
  }
});
