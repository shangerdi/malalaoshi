Meteor.publish('areas', function() {
  return Areas.find();
});
Meteor.publish("userData", function () {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId},
                             {fields: {'role': 1}});
  } else {
    this.ready();
  }
});
Meteor.publish('messages', function() {
  return Messages.find({userId: this.userId, read: {$ne: true}});
});
Meteor.publish('feedbacks', function() {
  return Feedbacks.find();
});
Meteor.publish('allusers', function() {
  return Meteor.users.find({}, {fields:{role:1,username:1,createdAt:1}});
});

Meteor.publish('curUserEducation', function() {
  return UserEducation.find({userId: this.userId});
});
Meteor.publish('curUserCertification', function() {
  return UserCertification.find({userId: this.userId});
});

Meteor.publish('userAudits', function(options) {
  var curUser = Meteor.users.findOne(this.userId);
  if (curUser.role=='admin'||curUser.role=='manager') {
    return UserAudit.find({}, options);
  } else {
    return UserAudit.find({userId: this.userId});
  }
});
Meteor.publish("auditOneTeacher", function (userId) {
  var curUser = Meteor.users.findOne(this.userId);
  if (curUser.role!='admin'&&curUser.role!='manager') {
    return [];
  }
  check(userId, String);
  return [
    Meteor.users.find({_id: userId}, {fields: {'profile': 1}}),
    UserEducation.find({'userId': userId}),
    UserCertification.find({'userId': userId}),
    UserAudit.find({'userId': userId})
  ];
});
