Meteor.methods({
  reserveCourses: function(params) {
    console.log(params);
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
    console.log("calc");
    // calc key time point: today, timeStamp, the day to start and already reserved list
    var exDays = ScheduleTable.tryDays;// TODO: calculate days to attend experience course.
    console.log('exDays:' + exDays);
    var now = new Date(), today = new Date(now.getFullYear(),now.getMonth(),now.getDate());
    console.log(today);
    var toStartDay = today.getDay()+exDays;
    if (toStartDay>7) {
      toStartDay -= 7;
    }
    var startDayTime = today.getTime()+exDays*ScheduleTable.MS_PER_DAY;
    console.log("toStartDay: "+toStartDay);
    // sort phases
    var sortedPhases = phases.sort(function(a,b){
      var dayA = (a.weekday>=toStartDay)?a.weekday:(a.weekday+7), dayB = (b.weekday>=toStartDay)?b.weekday:(b.weekday+7);
      var tmp = dayA-dayB;
      if (tmp!=0) return tmp;
      return a.start-b.start;
    });
    console.log("sortedPhases: "+sortedPhases);
    var reservedList = ScheduleTable.getWeeklyTeacherReservedList(teacherId, now, exDays);
    console.log('reservedList: '+reservedList);
    // generate new records to attend course
    var isConflict = false, count=0, weekCount=0, toInsertList=[];
    while(!isConflict && count<lessonCount) {
      _.each(sortedPhases, function(phase){
        if (isConflict || count>=lessonCount) {
          return;
        }
        // find conflict phases
        var item = _.find(reservedList, function(obj){
          return obj.weekday==phase.weekday && obj.phase.start==phase.start && obj.phase.end==phase.end;
        });
        if (item) {
          isConflict = true;
          throw new Meteor.Error('时间冲突', "您选择的上课时间和别人冲突了，请确认！");
          return;
        }
        // new phase to attend course
        var newAttendTime;
        if (toStartDay<=phase.weekday) {
          newAttendTime = startDayTime+(phase.weekday-toStartDay+weekCount*7)*ScheduleTable.MS_PER_DAY+phase.start*ScheduleTable.MS_PER_MINUTE;
        } else {
          newAttendTime = startDayTime+(7+phase.weekday-toStartDay+weekCount*7)*ScheduleTable.MS_PER_DAY+phase.start*ScheduleTable.MS_PER_MINUTE;
        }
        toInsertList.push({
          'teacher':{'id':teacherId,'name':teacher.profile.name},
          'student':{'id':curUser._id,'name':curUser.profile.name},
          'attendTime':newAttendTime,
          'weekday': phase.weekday,
          'phase':{'start':phase.start,'end':phase.end},
          'state':ScheduleTable.attendanceStateDict["reserved"].value
        });
        count++;
      });
      weekCount++;
      console.log(weekCount);
    }
    console.log(toInsertList);
    if (isConflict) {
      throw new Meteor.Error('时间冲突', "您选择的上课时间和别人冲突了，请确认！");
    }
    // insert
    // CourseAttendances.insert(toInsertList);
    _.each(toInsertList, function(data){
      CourseAttendances.insert(data);
    });
    return true;
  }
});
