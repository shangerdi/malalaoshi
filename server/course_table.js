Meteor.methods({
  reserveCourses: function(params) {
    console.log(params);
    var curUser = Meteor.user();
    if (!curUser) {
      throw new Meteor.Error('权限不足', "需要登录");
    }
    var teacherId = params.teacherId, lessonCount = params.lessonCount, phases = params.phases;
    var teacher = Meteor.users.findOne({"_id": teacherId, role: 'teacher'});
    if (!teacher) {
      throw new Meteor.Error('教师不存在', "没有查找到该教师的记录");
    }
    if (lessonCount<1 || phases.length==0) {
      throw new Meteor.Error('课时参数错误', "请核对课时数或选择时间段");
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
    var exDays = CourseTable.experienceDays;// TODO: calculate days to attend experience course.
    console.log('exDays:' + exDays);
    var now = new Date(), today = new Date(now.getFullYear(),now.getMonth(),now.getDate());
    console.log(today);
    var toStartDay = today.getDay()+exDays;
    if (toStartDay>7) {
      toStartDay -= 7;
    }
    console.log("toStartDay: "+toStartDay);
    var firstTime = today.getTime()+exDays*24*60*60*1000, aWeekLaterTime = today.getTime()+(7+exDays)*24*60*60*1000;
    console.log("firstTime: "+new Date(firstTime)+", aWeekLaterTime: "+new Date(aWeekLaterTime));
    var reservedList = CourseAttendances.find({"teacher.id":teacherId, 'attendDay': {$gte: firstTime, $lt: aWeekLaterTime}}).fetch();
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
          var tmpDate = new Date(obj.attendDay), weekday = tmpDate.getDay();
          weekday = (weekday==0?7:weekday);
          return weekday==phase.weekday && obj.phase.start==phase.start && obj.phase.end==phase.end;
        });
        if (item) {
          isConflict = true;
          return;
        }
        // new phase to attend course
        var newAttendDayTime;
        if (toStartDay<=phase.weekday) {
          newAttendDayTime = firstTime+(phase.weekday-toStartDay+weekCount*7)*24*60*60*1000;
        } else {
          newAttendDayTime = firstTime+(7+phase.weekday-toStartDay+weekCount*7)*24*60*60*1000;
        }
        toInsertList.push({
          'teacher':{'id':teacherId,'name':teacher.profile.name},
          'student':{'id':curUser._id,'name':curUser.profile.name},
          'attendDay':newAttendDayTime,
          'phase':{'start':phase.start,'end':phase.end},
          'state':CourseTable.attendanceStateDict["reserved"].value
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
  }
});
