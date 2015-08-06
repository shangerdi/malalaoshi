// course_table.js
// “课程表数据”定义文件

/**
 * 基本数据字典定义。周几，时间段，状态
 */
// 星期几定义：星期一~星期天，定义为数字1~7。(注：星期天为7，不用0是为了可读性，而且0可以表示false)
// 时间段定义 (注：start,end是开始的小时，24小时制。分钟以后再扩展字段。)
courseTablePhaseDict = {
  1:{desc:"8:00 ~ 10:00", start:8, end:10},
  2:{desc:"10:00 ~ 12:00", start:10, end:12},
  3:{desc:"13:00 ~ 15:00", start:13, end:15},
  4:{desc:"15:00 ~ 17:00", start:15, end:17},
  5:{desc:"17:00 ~ 19:00", start:17, end:19},
  6:{desc:"19:00 ~ 21:00", start:19, end:21}
}
// 某时间段状态定义
var courseTableStateDict = {
  1:{desc:"不可约课", color:"gray"},
  2:{desc:"可约课", color:"green"},
  3:{desc:"已被约课", color:"yellow"},
  4:{desc:"预定状态：已被选定，但是未付款", color:"orange"}
}
// 上课进行状态
var courseAttendanceStateDict = {
  1:{desc:"已预约，未上课"},
  2:{desc:"已确认上课"},
  3:{desc:"已评价"}
}

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
/**
 * 教师课程表定义 (具有循环性，只定义星期一到星期天的时间安排，不指定具体日期)
 */
var _courseTablePhaseSchema = new SimpleSchema({
  weekday: {
    type: Number,
    label: "Day number in week",
    min: 1,
    max: 7
  },
  phase: {
    type: Number,
    label: "Time phase in day",
    min: 1
  },
  state: {
    type: Number,
    label: "Available State",
    min: 1
  }
});
var teacherCourseTableSchema = new SimpleSchema({
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
  attendDay: {
    type: Number,
    label: "the day to attend course" // Need to calculate the date by the number
  },
  phase: {
    type: Number,
    label: "Time phase in day",
    min: 1
  },
  state: {
    type: Number,
    label: "Course Attendance State"
  },
  detail: {// TBD: order info, course info, etc.
    type: Object,
    optional: true,
    blackbox: true
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
