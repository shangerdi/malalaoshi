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
    label: 'Audit Status'
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
    label: 'Submit Time'
  },
  isQualified:{ // 是否面试通过，成为合格的麻辣老师
    type: Boolean,
    label: 'Qualified to be a teacher',
    optional: true
  },
  isFulltime:{ // 是否全职，否则兼职
    type: Boolean,
    label: 'Full-time(or Part-time)',
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
    type: String,
    optional: true,
    label: 'Experience'
  },
  eduResults: {
    type: String,
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
