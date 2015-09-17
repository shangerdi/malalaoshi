TeacherController = RouteController.extend({
  waitOn: function(){
    var teacherId = this.params.id;
    var attendanceQuery = {find:{"teacher.id": teacherId},options:{}};
    var now = new Date(), todayTime = new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime(), laterTime = todayTime+(7+ScheduleTable.tryDays)*ScheduleTable.MS_PER_DAY;
    attendanceQuery.find.attendTime = {$gte: todayTime, $lt: laterTime};
    var commentParams = {
      find: {'teacher.id': teacherId},
      options: {sort: {createdAt: -1 }, limit: 1}
    }
    return [
      Meteor.subscribe('teacher', teacherId),
      Meteor.subscribe('teacherAvailableTime', teacherId),
      Meteor.subscribe('areaTimePhasesByTeacher', teacherId),
      Meteor.subscribe('courseAttendances', attendanceQuery),
      Meteor.subscribe('commentsWidthUserDetail', commentParams)
    ];
  },
  data: function(){
    var id = this.params.id;
    var user = Meteor.users.findOne({"_id": id});
    var userEdu = UserEducation.findOne({'userId': id});
    var teacherAudit = TeacherAudit.findOne({'userId': id});
    var studyCenters = user && user.profile && user.profile.studyCenter ? StudyCenter.find({"_id": {$in: user.profile.studyCenter}}) : null;
    var comment = Comments.findOne({'teacher.id': id});
    return {
      user: user,
      userEdu: userEdu,
      teacherAudit: teacherAudit,
      studyCenters: studyCenters,
      comment: comment
    }
  }
});
