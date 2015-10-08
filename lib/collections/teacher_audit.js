/**
 * 老师审核信息集合：
 *  审核状态status：未提交 null，已提交待审核 submited，已驳回 rejected，审核通过 approved。
 */
TeacherAudit = new Mongo.Collection('teacherAudit');
TeacherAuditLogs = new Mongo.Collection('teacherAuditLogs');

TeacherAuditParts = ['basic','edu','cert'];

TeacherAuditPartSchema = new SimpleSchema({
  submitTime:{
    type: Number,
    label: 'Submit Time',
    optional: true
  },
  status:{
    type: String,
    label: 'Audit Status',
    allowedValues: ['submited', 'approved', 'rejected']
  },
  msg:{
    type: String,
    label: 'Message',
    optional: true
  },
  auditTime:{
    type: Number,
    label: 'Audit Time',
    optional: true
  },
  auditUserId:{
    type: String,
    label: 'Audit UserId',
    optional: true
  }
});
var _experienceSchema = new SimpleSchema({
  id:{
    type: String,
    label: "ID"
  },
  startDate:{
    type: Number,
    label: "Start Date"
  },
  endDate:{
    type: Number,
    label: "End Date",
    optional: true
  },
  content:{
    type: String,
    label: "Content",
    max: 500
  }
});
var _eduResultSchema = new SimpleSchema({
  id:{
    type: String,
    label: "ID"
  },
  title:{
    type: String,
    label: "Title",
    max: 50
  },
  doneDate:{
    type: Number,
    label: "The Date that result is done"
  },
  content:{
    type: String,
    label: "Content",
    max: 500
  }
});
var _subjectPriceSchema = new SimpleSchema({
  subject: {
    type: String,
    label: '科目',
    optional: true
  },
  grade: {
    type: String,
    label: '年级',
    optional: true
  },
  stage: {
    type: String,
    label: '阶段',
    optional: true
  },
  price: {
    type: Number,
    decimal: true,
    label: 'Price / Hour'
  }
});
TeacherAuditSchema = new SimpleSchema({
  userId:{
    type: String,
    label: 'Teacher Id'
  },
  name: {
    type: String,
    label: 'Teacher Name',
    optional: true
  },
  submitTime:{
    type: Number,
    label: 'Submit Time',
    autoValue: function() {
      if(this.isUpdate || this.isUpsert || this.isInsert){
        return Date.now();
      }
    }
  },
  applyStatus:{ // 申请状态: 面试通过，已开启
    type: String,
    label: '申请状态',
    allowedValues: ['passed', 'started'],
    optional: true
  },
  type: { // 职位类别： 全职 or 兼职
    type: String,
    label: 'Full-time/Part-time',
    allowedValues: ['fullTime', 'partTime'],
    optional: true
  },
  prices: { // 课时单价
    type: [_subjectPriceSchema],
    label: 'Price of each subject',
    optional: true
  },
  basicInfo: {
    type: TeacherAuditPartSchema,
    label: 'Basic Info\'s Audited Info',
    optional: true
  },
  eduInfo: {
    type: TeacherAuditPartSchema,
    label: 'Education Info\'s Audited Info',
    optional: true
  },
  certInfo: {
    type: TeacherAuditPartSchema,
    label: 'Certification Info\'s Audited Info',
    optional: true
  },
  auditTime:{
    type: Number,
    label: 'Audit Time',
    optional: true
  },
  auditUserId:{
    type: String,
    label: 'Audit UserId',
    optional: true
  },
  experience: {
    type: [_experienceSchema],
    optional: true,
    label: 'Experience'
  },
  eduResults: {
    type: [_eduResultSchema],
    optional: true,
    label: 'Education results'
  },
  personalPhoto: {
    type: [String],
    optional: true,
    label: 'Personal photo'
  }
});
TeacherAuditLogsSchema = new SimpleSchema({
  userId:{
    type: String,
    label: 'Teacher Id'
  },
  auditTime:{
    type: Number,
    label: 'Audit Time'
  },
  auditUserId:{
    type: String,
    label: 'Audit UserId'
  },
  part:{
    type: String,
    label: 'Audited Part'
  },
  basicInfo: {
    type: TeacherAuditPartSchema,
    label: 'Basic Info\'s Audited Info',
    optional: true
  },
  eduInfo: {
    type: TeacherAuditPartSchema,
    label: 'Education Info\'s Audited Info',
    optional: true
  },
  certInfo: {
    type: TeacherAuditPartSchema,
    label: 'Certification Info\'s Audited Info',
    optional: true
  }
});

TeacherAudit.attachSchema(TeacherAuditSchema);
TeacherAuditLogs.attachSchema(TeacherAuditLogsSchema);

TeacherAudit.getTeacherUnitPrice = function(teacherId, subject, grade, stage) {
  if (!teacherId) {
    throw new Meteor.Error('参数错误', "需要指定教师ID");
  }
  var obj = TeacherAudit.findOne({'userId': teacherId});
  if (!obj || !obj.prices) {
    throw new Meteor.Error('状态错误', "该教师没有课时单价设置");
  }
  if (_.isNumber(obj.prices)) {
    return obj.prices;
  }
  if (_.isArray(obj.prices)) {
    if (obj.prices.length===1) {
      return obj.prices[0].price;
    }
    var item = _.find(obj.prices, function(tmp){
      if (subject && tmp.subject && subject!=tmp.subject) {
        return false;
      }
      if (grade && tmp.grade && grade!=tmp.grade) {
        return false;
      }
      if (stage && tmp.stage && stage!=tmp.stage) {
        return false;
      }
      return true;
    });
    if (item) {
      return item.price;
    }
  }
  throw new Meteor.Error('状态错误', "该教师没有课时单价设置");
}
