// course_table.js
// “课程表数据”定义文件

/**
 * 基本数据字典定义。周几，时间段，状态
 */
// 星期几定义：星期一~星期天，定义为数字1~7。(注：星期天为7，不用0是为了可读性，而且0可以表示false)
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

/**
 * 地区时间段表
 */
defaultTimePhases = [
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
TeacherCourseTables = new Mongo.Collection("teacherCourseTables");
TeacherCourseTables.attachSchema(teacherCourseTableSchema);

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
    type: _timePhaseSchema
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
  modifiedAt: {
    type: Number,
    label: 'Modified at',
    autoValue: function() {
      if(this.isInsert || this.isUpsert){
        return Date.now();
      }
    }
  },
  createdAt: {
    type: Number,
    label: 'Created at',
    autoValue: function() {
      if(this.isInsert){
        return Date.now();
      }
    }
  }
});
CourseAttendances = new Mongo.Collection("courseAttendances");
CourseAttendances.attachSchema(courseAttendanceSchema);
