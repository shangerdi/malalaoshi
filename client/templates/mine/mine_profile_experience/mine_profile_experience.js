var maxCount = 200;
var inputCount = new ReactiveVar(0);
var saveProfileExperience = function(e) {
  var startDate = $("#startDate").val();
  var endDate = $("#endDate").val();
  var content = $("#content").val();
  if (!startDate || !endDate || !content) {
    alert("请确保各项内容填写正确！");
    return;
  }
  content=$.trim(content);
  if (maxCount < content.length) {
    IonPopup.show({
      'template': "字数太多了",
      'buttons': []
    });
    setTimeout(function () {
      IonPopup.close();
    }, 800);
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
Template.mineProfileExperience.onRendered(function(){
  $("[data-action=save-profile-experience]").click(saveProfileExperience);
  var obj = Router.current().params.query;
  if (obj) {
    $("#startDate").val(obj.startDate);
    $("#startDateText").val(formatDate(obj.startDate, 'YYYY年MM月'));
    $("#endDate").val(obj.endDate);
    $("#endDateText").val(formatDate(obj.endDate, 'YYYY年MM月'));
    $("#content").val(obj.content);
    inputCount.set($("#content").val().length);
  }
});
Template.mineProfileExperience.helpers({
  'getId': function() {
    return Router.current().params.id;
  },
  'leftCount': function() {
    return maxCount - inputCount.get();
  },
  'overflow': function() {
    if (maxCount < inputCount.get()) {
      return 'overflow';
    }
  }
});
var setDateById = function(dateTarget) {
  var year = Session.get("curSwiperYear");
  var month = Session.get("curSwiperMonth");
  var day = 1;
  var momentObj = moment([year, month-1, day]);
  if (!momentObj.isValid()) {
    alert("选择出错，请重新选择");
    return;
  }
  $("#"+dateTarget).val(momentObj.valueOf());
  $("#"+dateTarget+"Text").val(momentObj.format('YYYY年M月'));
}
Template.mineProfileExperience.events({
  'keyup #content, change #content, blur #content, mousedown #content, touchend #content': function(e) {
    inputCount.set($("#content").val().length);
  },
  'click #startDateText': function(e) {
    IonActionSheetCustom.show('_dateYYYYMMActionSheet',{
      titleText: '开始时间',
      finishText: '完成',
      cancelText: '取消',
      buttons: [],
      finish: function() {
        setDateById('startDate');
      }
    });
  },
  'click #endDateText': function(e) {
    IonActionSheetCustom.show('_dateYYYYMMActionSheet',{
      titleText: '结束时间',
      finishText: '完成',
      cancelText: '取消',
      buttons: [],
      finish: function() {
        setDateById('endDate');
      }
    });
  }
});
