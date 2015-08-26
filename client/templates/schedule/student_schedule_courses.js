var findOptions = function() {
  var param = {find:{},options:{}};
  if (!Meteor.userId() || !Meteor.user()) {
    return param;
  }
  param.find["student.id"]=Meteor.userId();
  var today = new Date();
  var startTime = today.getTime() - ScheduleTable.timeForRenew;
  param.find.attendTime = {'$gte': today.getTime()};
  param.find.state = ScheduleTable.attendanceStateDict["reserved"].value;
  param.options.limit = Template.instance().data.limit;
  return param;
};
Template.studentScheduleCourses.onRendered(function(){
  console.log(this.data);
});
Template.studentScheduleCourses.helpers({
  courses: function(){
    var param = findOptions();
    return CourseAttendances.find(param.find, param.options);
  }
});
