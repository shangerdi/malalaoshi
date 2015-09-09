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
    return CourseAttendances.find(param.find, param.options);
  }
});
