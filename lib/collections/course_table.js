// course_table.js
// “课程表数据”定义文件
ScheduleTable = {};
/**
 * 基本数据字典定义。周几，时间段，状态
 */
// 星期几定义：星期一~星期天，定义为数字1~7。(注：星期天为7，不用0是为了可读性，而且0可以表示false)
ScheduleTable.days = [1,2,3,4,5,6,7];
ScheduleTable.dayNumWords = ['天','一','二','三','四','五','六','日'];
ScheduleTable.tryDays = 2; // 上体验课的天数
ScheduleTable.timeForRenew = 2*60*60*1000; // 为续约预留的时间
ScheduleTable.timeToConfirm = 14*60*60*1000; // 课程结束后等待确认的时间，超时后系统自动确认
ScheduleTable.MS_PER_DAY = 24*60*60*1000;
ScheduleTable.MS_PER_MINUTE = 60*1000;
ScheduleTable.convMinutes2Str = function(mins) {
  var sH=mins/60, sM=mins%60;
  return (sH<10?'0'+sH:sH)+':'+(sM<10?'0'+sM:sM);
}
// 时间段定义 (注意：start,end是分钟，即一天内从"0点0分"开始计算出的分钟数。)
var _timePhaseSchema = new SimpleSchema({
  start:{
    type: Number,
    label: "The minute to start",
    min: 0,
    max: 1440
  },
  end:{
    type: Number,
    label: "The minute to end",
    min: 0,
    max: 1440
  }
});

// 某时间段状态定义
var courseTableStateDict = {
  'unavailable':{value:1, key:"available",   desc:"不可约课"},
  'available':  {value:2, key:"unavailable", desc:"可约课"}
}
// 上课进行状态
var courseAttendanceStateDict = {
  'reserved':{value:1, key:"reserved", desc:"已预约，未上课"},
  'attended':{value:2, key:"attended", desc:"已确认上课"},
  'commented':  {value:3, key:"commented",   desc:"已评价"}
}
ScheduleTable.attendanceStateDict = courseAttendanceStateDict;

/**
 * 地区时间段表
 */
ScheduleTable.defaultTimePhases = [
  {start:8*60, end:10*60},
  {start:10*60, end:12*60},
  {start:13*60, end:15*60},
  {start:15*60, end:17*60},
  {start:17*60, end:19*60},
  {start:19*60, end:21*60},
];
var areaTimePhaseSchema = new SimpleSchema({
  code: {
    type: String,
    label: 'Area Code',
    index: true
  },
  type: {
    type: String,
    label: 'Full-time/Part-time',
    allowedValues: ['fullTime', 'partTime'],
    defaultValue: 'fullTime'
  },
  phases: {
    type: [_timePhaseSchema]
  }
});
AreaTimePhases = new Mongo.Collection("areaTimePhases");
AreaTimePhases.attachSchema(areaTimePhaseSchema);

var _simpleTeacherSchema = new SimpleSchema({
  id:{
    type: String,
    label: 'Teacher Id',
    index: true
  },
  name:{
    type: String,
    label: 'Teacher Name',
    optional: true
  }
});
var _simpleStudentSchema = new SimpleSchema({
  id:{
    type: String,
    label: 'Student Id',
    index: true
  },
  name:{
    type: String,
    label: 'Student Name',
    optional: true
  }
});
var _courseAttendanceDetailSchema = new SimpleSchema({  //I only use orderId, anybody modify by yourself
  orderId: {
    type: String,
    label: 'Order Id'
  },
  subject: {          //no body use this can be deleted
    type: String,
    label: 'subject'
  },
  confirmType: {
    type: Number,
    label: 'Confirm type',
    optional: true
  }
});
/**
 * 教师课程表定义 (具有循环性，只定义星期一到星期天的可约课时间安排，不指定具体日期)
 */
var _courseTablePhaseSchema = new SimpleSchema({
  weekday: {
    type: Number,
    label: "Day number in week",
    min: 1,
    max: 7
  },
  phase: {
    type: _timePhaseSchema
  }
});
var teacherAvailableTimeSchema = new SimpleSchema({
  teacher: {
    type: _simpleTeacherSchema
  },
  phases: {
    type: [_courseTablePhaseSchema]
  },
  createdAt: {
    type: Number,
    label: 'Created at',
    optional: true,
    autoValue: function() {
      if(this.isInsert || this.isUpsert){
        return Date.now();
      }
    }
  }
 });
TeacherAvailableTimes = new Mongo.Collection("teacherAvailableTimes");
TeacherAvailableTimes.attachSchema(teacherAvailableTimeSchema);

/**
 * 上课安排表 (具体到某一天，老师和学生的上课表)
 */
var courseAttendanceSchema = new SimpleSchema({
  teacher: {
    type: _simpleTeacherSchema
  },
  student: {
    type: _simpleStudentSchema
  },
  attendTime: {
    type: Number,
    label: "Datetime to attend course" // Need to calculate the date by the number
  },
  endTime: {
    type: Number,
    label: "Datetime that course is finish"
  },
  weekday: {
    type: Number,
    label: "Day number in week",
    min: 1,
    max: 7
  },
  phase: {
    type: _timePhaseSchema
  },
  state: {
    type: Number,
    label: "Course Attendance State"
  },
  detail: {// TBD: order info, course info, etc.
    type: _courseAttendanceDetailSchema,
    optional: true
  },
  modifiedAt: {
    type: Number,
    label: 'Modified at',
    autoValue: function() {
      if(this.isUpdate || this.isUpsert || this.isInsert){
        return Date.now();
      }
    }
  },
  createdAt: {
    type: Number,
    label: 'Created at',
    autoValue: function() {
      if(this.isInsert || this.isUpsert){
        return Date.now();
      }
    }
  }
});
CourseAttendances = new Mongo.Collection("courseAttendances");
CourseAttendances.attachSchema(courseAttendanceSchema);

ScheduleTable.getAttendTimeQueryStart = function(now) {
  return now.getTime()-ScheduleTable.timeForRenew;
}

ScheduleTable.getWeeklyTeacherReservedList = function(teacherId, now, exDays) {
  var firstTime = this.getAttendTimeQueryStart(now), aWeekLaterTime = now.getTime()+(7+exDays)*ScheduleTable.MS_PER_DAY;
  return CourseAttendances.find({"teacher.id":teacherId, 'endTime':{$gt: firstTime}, 'attendTime': {$lt: aWeekLaterTime}}).fetch();
}

ScheduleTable.generateReserveCourseRecords = function(curUser, teacher, lessonCount, phases, isCheckOnly, order) {
  if (!curUser || !teacher || !lessonCount || !phases || !phases.length) {
    return null;
  }
  var teacherId = teacher._id;
  // console.log("calc");
  // calc key time point: today, timeStamp, the day to start and already reserved list
  var exDays = ScheduleTable.tryDays;// TODO: calculate days to attend experience course.
  // console.log('exDays:' + exDays);
  var now = new Date(), today = new Date(now.getFullYear(),now.getMonth(),now.getDate());
  // console.log(today);
  var toStartDay = today.getDay()+exDays;
  if (toStartDay>7) {
    toStartDay -= 7;
  }
  var startDayTime = today.getTime()+exDays*ScheduleTable.MS_PER_DAY;
  // console.log("toStartDay: "+toStartDay);
  // sort phases
  var sortedPhases = phases.sort(function(a,b){
    var dayA = (a.weekday>=toStartDay)?a.weekday:(a.weekday+7), dayB = (b.weekday>=toStartDay)?b.weekday:(b.weekday+7);
    var tmp = dayA-dayB;
    if (tmp!=0) return tmp;
    return a.start-b.start;
  });
  // console.log("sortedPhases: "+sortedPhases);
  var reservedList = ScheduleTable.getWeeklyTeacherReservedList(teacherId, now, exDays);
  // console.log('reservedList: '+reservedList);
  // generate new records to attend course
  var count=0, weekCount=0, toInsertList=[];
  while(count<lessonCount) {
    _.each(sortedPhases, function(phase){
      if (count>=lessonCount) {
        return;
      }
      // find conflict phases
      var item = _.find(reservedList, function(obj){
        return obj.weekday==phase.weekday && obj.phase.start==phase.start && obj.phase.end==phase.end;
      });
      if (item) {
        throw new Meteor.Error('时间冲突', "您选择的上课时间和别人冲突了，请确认！");
      }
      // new phase to attend course
      var newAttendTime, endTime;
      if (toStartDay<=phase.weekday) {
        newAttendTime = startDayTime+(phase.weekday-toStartDay+weekCount*7)*ScheduleTable.MS_PER_DAY+phase.start*ScheduleTable.MS_PER_MINUTE;
        endTime = startDayTime+(phase.weekday-toStartDay+weekCount*7)*ScheduleTable.MS_PER_DAY+phase.end*ScheduleTable.MS_PER_MINUTE;
      } else {
        newAttendTime = startDayTime+(7+phase.weekday-toStartDay+weekCount*7)*ScheduleTable.MS_PER_DAY+phase.start*ScheduleTable.MS_PER_MINUTE;
        endTime = startDayTime+(7+phase.weekday-toStartDay+weekCount*7)*ScheduleTable.MS_PER_DAY+phase.end*ScheduleTable.MS_PER_MINUTE;
      }
      if (!isCheckOnly) {
        toInsertList.push({
          'teacher':{'id':teacherId,'name':teacher.profile.name},
          'student':{'id':curUser._id,'name':curUser.profile.name},
          'attendTime':newAttendTime,
          'endTime':endTime,
          'weekday': phase.weekday,
          'phase':{'start':phase.start,'end':phase.end},
          'state':ScheduleTable.attendanceStateDict["reserved"].value,
          'detail':{'orderId':order?order._id:'Test','subject':order?order.subject:"Test"}
        });
      }
      count++;
    });
    weekCount++;
    // console.log(weekCount);
  }
  return toInsertList;
}
ScheduleTable.findAttendancesByDate = function(curUser, date) {
  var findParams={};
  if (curUser.role==='teacher') {
    findParams["teacher.id"]=curUser._id;
  } else {
    findParams["student.id"]=curUser._id;
  }
  var year = date.year, month = date.month, day = date.date;
  var targetDay = new Date(year, month-1, day), startTime = targetDay.getTime(), endTime = startTime + ScheduleTable.MS_PER_DAY;
  findParams.attendTime = {$gte: startTime, $lt: endTime};
  return CourseAttendances.find(findParams).fetch();
}
