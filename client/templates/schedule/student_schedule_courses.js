var showToastInfo = function(msg) {
  var width=150, height=50, viewHeight = $(window).height(), viewWidth = $(window).width();
  var html = '<div class="toast-box" style="position: fixed;top:'+(viewHeight-height)/2+'px;left:'+(viewWidth-width)/2+'px;'
    +'width: '+width+'px;height: '+height+'px;line-height: '+height+'px;padding: 0 10px;'
    +'background: rgba(0,0,0,0.8);color: #eee;text-align: center;z-index: 999999;">'
    + msg
    + '</div>';
  $('.toast-box').remove();
  $(document.body).append(html);
  setTimeout(function() {
    $('.toast-box').remove();
  }, 800);
}
var findOptions = function() {
  var param = {find:{},options:{}};
  if (!Meteor.userId() || !Meteor.user()) {
    return null;
  }
  param.find["student.id"]=Meteor.userId();
  var tab = Router.current().route.getName(), now = new Date(), nowTime = now.getTime();
  if (tab==='coursesToconfirm') { // 查询待确认完成的课程
    var startTime = nowTime - ScheduleTable.timeToConfirm;
    param.find.endTime = {'$gte': startTime, '$lte': nowTime};
    param.find.state = ScheduleTable.attendanceStateDict["reserved"].value;
  } else if (tab==='coursesConfirmed') { // 查询确认后的课程
    param.find.endTime = {'$lte': nowTime};
    param.find.state = {'$in': [ScheduleTable.attendanceStateDict["attended"].value, ScheduleTable.attendanceStateDict["commented"].value]};
  } else {
    return null;
  }
  param.options.limit = Template.instance().data.limit;
  return param;
};
Template.studentScheduleCourses.onRendered(function(){
  Session.set('ionTab.current', this.data.tab);
});
Template.studentScheduleCourses.helpers({
  courses: function(){
    var param = findOptions();
    if (!param) return null;
    return CourseAttendances.find(param.find, param.options);
  },
  getCourseTime: function(timestamp) {
    return moment(timestamp).format('YYYY年MM月DD日');
  },
  convMinutes2Str: function(mins) {
    return ScheduleTable.convMinutes2Str(mins);
  },
  getAvatarUrl: function(userId) {
    var user = Meteor.users.findOne(userId);
    if (user && user.profile) {
      return user.profile.avatarUrl;
    }
  }
});
Template.studentScheduleCourses.events({
  'click .btn-confirm': function(e) {
    var ele=e.target, $ele=$(ele);
    var itemId = $ele.closest('div').data('itemid');
    Meteor.call('confirmCourseAttended', itemId, function(err, result){
      if (err) {
        showToastInfo("出错了，请稍后重试");
        return;
      }
      showToastInfo("已确认");
    });
  },
  'click .btn-comment': function(e) {
    var ele=e.target, $ele=$(ele);
    var itemId = $ele.closest('div').data('itemid');
    showToastInfo("出错了，请稍后重试");
  }
});
