TeacherController = RouteController.extend({
  waitOn: function(){
    var attendanceQuery = {find:{"teacher.id":this.params.id},options:{}};
    var now = new Date(), todayTime = new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime(), laterTime = todayTime+(7+ScheduleTable.tryDays)*ScheduleTable.MS_PER_DAY;
    attendanceQuery.find.attendTime = {$gte: todayTime, $lt: laterTime};
    return [
      Meteor.subscribe('teacher', this.params.id),
      Meteor.subscribe('teacherAvailableTime', this.params.id),
      Meteor.subscribe('areaTimePhasesByTeacher', this.params.id),
      Meteor.subscribe('courseAttendances', attendanceQuery)
    ];
  },
  data: function(){
    var id = this.params.id;
    var user = Meteor.users.findOne({"_id": id});
    var userEdu = UserEducation.findOne({'userId': id});
    var teacherAudit = TeacherAudit.findOne({'userId': id});
    var studyCenters = user && user.profile && user.profile.studyCenter ? StudyCenter.find({"_id": {$in: user.profile.studyCenter}}) : null;
    return {
      user: user,
      userEdu: userEdu,
      teacherAudit: teacherAudit,
      studyCenters: studyCenters
    }
  }
});
