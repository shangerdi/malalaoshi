var maxCount = 200;
var inputCount = new ReactiveVar(0);
var saveProfileEduResult = function(e) {
  var title = $("#title").val();
  var doneDate = $("#doneDate").val();
  var content = $("#content").val();
  if (!title || !doneDate || !content) {
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
    $("#doneDateText").val(formatDate(obj.doneDate, 'YYYY年MM月'));
    $("#content").val(obj.content);
    inputCount.set($("#content").val().length);
  }
});
Template.mineProfileEduResult.helpers({
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
Template.mineProfileEduResult.events({
  'keyup #content, change #content, blur #content, mousedown #content, touchend #content': function(e) {
    inputCount.set($("#content").val().length);
  },
  'click #doneDateText': function(e) {
    Session.set('dateSelectTargetId', 'doneDate');
    IonActionSheetCustom.show('_dateYYYYMMActionSheet',{
      titleText: '时间',
      finishText: '完成',
      cancelText: '取消',
      buttons: [],
      finish: function() {
        setDateById('doneDate');
      }
    });
  }
});
