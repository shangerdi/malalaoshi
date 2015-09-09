/* 约课处理锁缓存，{_id:teacherId, lockTime:timestamp}*/
var Fiber = Npm.require('fibers');

doReserveCourses = function(student, teacher, lessonCount, phases, order) {
  var curFiber = Fiber.current, error = false;
  // console.log('teacher:'+teacher._id+", student:"+student._id);
  AsyncLocks.lock(teacher._id, Meteor.bindEnvironment(function(leaveCallback) {
    try {
      // console.log("in callback");
      // sleep(5000);
      var toInsertList = ScheduleTable.generateReserveCourseRecords(student, teacher, lessonCount, phases, false, order);
      // console.log(toInsertList);
      // insert into DB
      // CourseAttendances.insert(toInsertList);
      _.each(toInsertList, function(data){
        CourseAttendances.insert(data);
      });
      // console.log("insert course attendances end");
    }catch(ex) {
      error = ex;
    }
    curFiber.run();
    leaveCallback();
  }));
  // console.log("reserve courses task is submit, waiting...");
  Fiber.yield();
  // console.log("reserve courses end。"+'teacher:'+teacher._id+", student:"+student._id);
  if (error) {
    throw error;
  }
}

Meteor.methods({
  reserveCourses: function(params) {
    // console.log(params);
    var curUser = Meteor.user();
    if (!curUser) {
      throw new Meteor.Error('权限不足', "需要登录");
    }
    var teacherId = params.teacherId, lessonCount = params.lessonCount, phases = params.phases;
    if (!teacherId || lessonCount<1 || phases.length==0) {
      throw new Meteor.Error('参数错误', "请核对所选教师、课时数和选择时间段");
    }
    var teacher = Meteor.users.findOne({"_id": teacherId, role: 'teacher'});
    if (!teacher) {
      throw new Meteor.Error('教师不存在', "没有查找到该教师的记录");
    }
    doReserveCourses(curUser, teacher, lessonCount, phases);
    return true;
  },
  saveAvailableTime: function(params) {
    var curUser = Meteor.user();
    if (!curUser) {
      throw new Meteor.Error('权限不足', "需要登录");
    }
    if (curUser.role!=='teacher') {
      throw new Meteor.Error('权限不足', "您不需要设置此项内容");
    }
    var teacherId = curUser._id, teacherName = curUser.profile.name, phases = params.phases;
    if (!teacherId || !_.isArray(phases)) {
      throw new Meteor.Error('参数错误', "参数错误");
    }
    var oldOne = TeacherAvailableTimes.findOne({'teacher.id': teacherId});
    if (oldOne) {
      TeacherAvailableTimes.update({'teacher.id': teacherId}, {$set: {'teacher.name': teacherName, 'phases': phases}});
    } else {
      TeacherAvailableTimes.insert({'teacher': {'id': teacherId, 'name': teacherName}, 'phases': phases});
    }
    return true;
  },
  confirmCourseAttended: function(itemId) {
    var curUser = Meteor.user();
    if (!curUser) {
      throw new Meteor.Error('权限不足', "需要登录");
    }
    CourseAttendances.update({'_id': itemId, 'student.id': curUser._id},{$set:{state:ScheduleTable.attendanceStateDict["attended"].value}});
    return true;
  }
});
