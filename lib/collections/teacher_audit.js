/**
 * 老师审核信息集合：
 *  审核状态status：未提交 null，已提交待审核 submited，已驳回 rejected，审核通过 approved。
 */
TeacherAudit = new Mongo.Collection('teacherAudit');
TeacherAuditLogs = new Mongo.Collection('teacherAuditLogs');