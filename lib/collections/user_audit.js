/**
 * 用户审核集合：
 *  审核状态status：未提交 null，已提交待审核 submited，已驳回 rejected，审核通过 approved。
 */
UserAudit = new Mongo.Collection('userAudit');
UserAuditLogs = new Mongo.Collection('userAuditLogs');