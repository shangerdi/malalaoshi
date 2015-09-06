Meteor.methods({
  insertComment: function(comment) {
    var curUser = Meteor.user();
    if (!curUser){
      throw new Meteor.Error('权限不足', "当前用户权限不足");
    }
    var courseAttendance = CourseAttendances.findOne({_id: comment.courseAttendanceId});

    if(!courseAttendance || courseAttendance.student.id != curUser._id){
      throw new Meteor.Error('权限不足', "不能给别人评论");
    }

    //TODO with transaction
    Comment.insert(comment, function(error, result){
      if(!error){
        CourseAttendances.update({_id: comment.courseAttendanceId}, {$set: {'state': ScheduleTable.attendanceStateDict['commented'].value}});
        Meteor.users.update({_id: comment.teacher.id}, {$inc: {"profile.maScore": comment.maScore, "profile.maCount": 1, "profile.laScore": comment.laScore, "profile.laCount": 1}});
      }
    });
  }
});
