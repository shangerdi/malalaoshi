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
    //Todo: 确认课时，需要修改课程状态，同时添加交易明细，且同时老师帐户增加余额，需要事务性
    var attendance = CourseAttendances.findOne({'_id': itemId});
    if (attendance &&
      attendance.attendTime &&
      attendance.endTime &&
      attendance.detail &&
      attendance.detail.orderId &&
      attendance.teacher) {
      var order = Orders.findOne({'_id': attendance.detail.orderId});
      //课程时长
      var courseDuration = attendance.endTime - attendance.attendTime; //in DateTime
      //课程费用 = (endTime - attendTime) * 单价
      var coursePrice = courseDuration / 1000 / 3600 * order.price;
      //平台佣金 20% 负数
      var charges = coursePrice * 0.2 * -1;

      //课程费用 明细
      var courseDetail = {};
      courseDetail.userId = attendance.teacher.id;
      courseDetail.courseId = itemId;
      courseDetail.amount = coursePrice;
      courseDetail.title = "课程收入";
      //todo: operator.role maybe parent or student or system ?
      courseDetail.operator = {'id': curUser._id, 'role': 'parent'};
      //平台佣金 明细
      var chargesDetail = {};
      chargesDetail.userId = attendance.teacher.id;
      chargesDetail.courseId = itemId;
      chargesDetail.amount = charges;
      chargesDetail.title = "平台佣金";
      //todo: operator.role maybe parent or student or system ?
      chargesDetail.operator = {'role': 'system'};
      //交易明细组合
      var transactionDetails = [];
      transactionDetails.push(courseDetail);
      transactionDetails.push(chargesDetail);
      //提交交易
      submitTransaction(transactionDetails);
      console.log("Transaction OK!");
      //最后修改课程状态
      CourseAttendances.update({'_id': itemId, 'student.id': curUser._id},{$set:{state:ScheduleTable.attendanceStateDict["attended"].value, 'detail.confirmType': 1}});
    }

    return true;
  },
  checkConflictCourseSchedule: function(params) {
    var curUser = Meteor.user();
    if (!curUser){
      throw new Meteor.Error('权限不足', "当前用户权限不足");
    }
    var count = params.courseCount, phases = params.phases;
    var result = {};
    // 检测自己的时间安排是否冲突
    if (ScheduleTable.isConflictWithOwnCourses(curUser, count, phases)) {
      result.own = true;
    }
    // 检测老师的时间安排是否冲突
    try {
      var curUser = Meteor.user(), teacher = Meteor.users.findOne({'_id':params.teacherId});
      if (phases && _.isArray(phases)) {
        ScheduleTable.generateReserveCourseRecords(curUser, teacher, count, phases, true);
      }
    } catch (ex) { // 没有异常即表示时间安排没有冲突
      result.teacher = true;
    }
    return result;
  }
});
