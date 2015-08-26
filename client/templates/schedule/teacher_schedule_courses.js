var findOptions = function() {
  var param = {find:{},options:{}};
  if (!Meteor.userId() || !Meteor.user()) {
    return null;
  }
  param.find["teacher.id"]=Meteor.userId();
  var tab = Router.current().route.getName(), now = new Date(), nowTime = now.getTime();
  if (tab==='coursesToattend') { // 还没去上课
    param.find.endTime = {'$gt': nowTime};
    param.find.state = ScheduleTable.attendanceStateDict["reserved"].value;
  } else if (tab==='coursesAttended') { // 上课时间已过去的
    param.find.endTime = {'$lte': nowTime};
  } else {
    return null;
  }
  param.options.limit = Template.instance().data.limit;
  return param;
};
Template.teacherScheduleCourses.onRendered(function(){
  Session.set('ionTab.current', this.data.tab);
});
Template.teacherScheduleCourses.helpers({
  courses: function(){
    var param = findOptions();
    if (!param) return null;
    return CourseAttendances.find(param.find, param.options);
  },
  getCourseTime: function(timestamp) {
    return moment(timestamp).format('MM月DD日');
  },
  convMinutes2Str: function(mins) {
    return ScheduleTable.convMinutes2Str(mins);
  },
  getStateStr: function(itemId) {
    var item = CourseAttendances.findOne(itemId);
    var now = new Date(), nowTime = now.getTime();
    if (nowTime>=item.attendTime && nowTime<item.endTime) {
      return '上课中';
    }
    if (nowTime>=item.endTime) {
      var curState=item.state, stateDict = ScheduleTable.attendanceStateDict;
      if (curState==stateDict["reserved"].value) {
        return '待确认';
      } else if (curState==stateDict['attended'].value) {
        if (item.detail && item.detail.confirmType==1) {
          return '家长确认';
        } else if (item.detail && item.detail.confirmType==2) {
          return '系统确认';
        }
        return '已确认';
      } else if (curState==stateDict['commented'].value) {
        return '已评价';
      }
    }
  }
});
