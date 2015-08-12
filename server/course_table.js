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
    console.log("sort phases");
    // sort phases
    var sortedPhase = phases.sort(function(a,b){
      var tmp = a.weekday-b.weekday;
      if (tmp!=0) return tmp;
      return a.start-b.start;
    });
    console.log(sortedPhase);
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
    console.log("toStartDay: "+toStartDay);
    var firstTime = today.getTime()+exDays*ScheduleTable.MS_PER_DAY, aWeekLaterTime = today.getTime()+(7+exDays)*ScheduleTable.MS_PER_DAY;
    console.log("firstTime: "+new Date(firstTime)+", aWeekLaterTime: "+new Date(aWeekLaterTime));
    var reservedList = CourseAttendances.find({"teacher.id":teacherId, 'attendTime': {$gte: firstTime, $lt: aWeekLaterTime}}).fetch();
    console.log('reservedList: '+reservedList);
    // generate new records to attend course
    var isConflict = false, count=0, weekCount=0, toInsertList=[];
    while(!isConflict && count<lessonCount) {
      _.each(sortedPhase, function(phase){
        if (isConflict || count>=lessonCount) {
          return;
        }
        // find conflict phases
        var item = _.find(reservedList, function(obj){
          var tmpDate = new Date(obj.attendTime), weekday = tmpDate.getDay();
          weekday = (weekday==0?7:weekday);
          return weekday==phase.weekday && obj.phase.start==phase.start && obj.phase.end==phase.end;
        });
        if (item) {
          isConflict = true;
          throw new Meteor.Error('时间冲突', "您选择的上课时间和别人冲突了，请确认！");
          return;
        }
        // new phase to attend course
        var newAttendTimeTime;
        if (toStartDay<=phase.weekday) {
          newAttendTimeTime = firstTime+(phase.weekday-toStartDay+weekCount*7)*ScheduleTable.MS_PER_DAY;
        } else {
          newAttendTimeTime = firstTime+(7+phase.weekday-toStartDay+weekCount*7)*ScheduleTable.MS_PER_DAY;
        }
        toInsertList.push({
          'teacher':{'id':teacherId,'name':teacher.profile.name},
          'student':{'id':curUser._id,'name':curUser.profile.name},
          'attendTime':newAttendTimeTime,
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
