var saveProfileExperience = function(e) {
  var startDate = $("#startDate").val();
  var endDate = $("#endDate").val();
  var content = $("#content").val();
  if (!startDate || !endDate || !content) {
    alert("请确保各项内容填写正确！");
    return;
  }
  var id = Router.current().params.id;
  var expObj = {'id': id, 'startDate': startDate, 'endDate': endDate, 'content': content};
  Meteor.call('updateExperience', expObj, function(err, result){
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
Template.mineProfileExperience.onRendered(function(){
  $("[data-action=save-profile-experience]").click(saveProfileExperience);
  var obj = Router.current().params.query;
  if (obj) {
    $("#startDate").val(obj.startDate);
    $("#startDateText").val(formatDate(obj.startDate));
    $("#endDate").val(obj.endDate);
    $("#endDateText").val(formatDate(obj.endDate));
    $("#content").val(obj.content);
  }
});
Template.mineProfileExperience.helpers({
  'getId': function() {
    return Router.current().params.id;
  }
});
Template.mineProfileExperience.events({
  'click #startDateText': function(e) {
    Session.set('dateSelectTargetId', 'startDate');
    IonModal.open("_dateSelectModal", {'title': "开始时间"});
  },
  'click #endDateText': function(e) {
    Session.set('dateSelectTargetId', 'endDate');
    IonModal.open("_dateSelectModal", {'title': "结束时间"});
  }
});
