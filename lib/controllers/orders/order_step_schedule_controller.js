/* 约课-选择课时界面 - controller */
OrderStepScheduleController = RouteController.extend({
  getTeacherId: function() {
    return Session.get('orderTeacherId');
  },
  waitOn: function(){
    var teacherId = this.getTeacherId();
    if (!teacherId) {
      return null;
    }
    var attendanceQuery = {find:{"teacher.id":teacherId},options:{}};
    var now = new Date(), todayTime = new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime(), laterTime = todayTime+(7+ScheduleTable.tryDays)*ScheduleTable.MS_PER_DAY;
    attendanceQuery.find.attendTime = {$gte: todayTime, $lt: laterTime};
    return [
      Meteor.subscribe('teacherAvailableTime', teacherId),
      Meteor.subscribe('areaTimePhasesByTeacher', teacherId),
      Meteor.subscribe('courseAttendances', attendanceQuery)
    ];
  },
  data:function(){
    return {teacherId: this.getTeacherId()}
  }
});
