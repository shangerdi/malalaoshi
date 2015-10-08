Template._dateSelectModal.onCreated(function(){
  var dateTarget = Session.get('dateSelectTargetId');
  if (!dateTarget) {
    return;
  }
  var dateVal = $("#"+dateTarget).val();
  if (dateVal) {
    var momentObj = moment(parseInt(dateVal));
    if (momentObj && momentObj.isValid()) {
      Session.set("curSwiperYear", momentObj.year());
      Session.set("curSwiperMonth", momentObj.month()+1);
      Session.set("curSwiperDay", momentObj.date());
      return;
    }
  }
  Session.set("curSwiperYear", false);
  Session.set("curSwiperMonth", false);
  Session.set("curSwiperDay", false);
});
Template._dateSelectModal.onDestroyed(function(){
  var dateTarget = Session.get('dateSelectTargetId');
  if (!dateTarget) {
    return;
  }
  var year = Session.get("curSwiperYear");
  var month = Session.get("curSwiperMonth");
  var day = Session.get("curSwiperDay");
  var momentObj = moment([year, month-1, day]);
  if (!momentObj.isValid()) {
    alert("选择出错，请重新选择");
    return;
  }
  $("#"+dateTarget).val(momentObj.valueOf());
  $("#"+dateTarget+"Text").val(momentObj.format('YYYY年M月D日'));
});
