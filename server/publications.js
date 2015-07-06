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
  return Messages.find({userId: this.userId});
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

Meteor.publish('teacherAudits', function(options) {
  var curUser = Meteor.users.findOne(this.userId);
  if (!curUser) {
    this.ready();
    return;
  }
  if (curUser.role=='admin'||curUser.role=='manager') {
    return TeacherAudit.find({}, options);
  } else {
    return TeacherAudit.find({userId: this.userId});
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
    TeacherAudit.find({'userId': userId})
  ];
});
Meteor.publish('pages', function() {
  var clm = Pages.find();
  return clm;
});
Meteor.publish('teachers', function(parameters) {
  if (this.userId) {
    this.relations({
      collection: TeacherAudit,
      filter: parameters.find,
      options: parameters.options,
      mappings: [
        {
          foreign_key: 'userId',
          collection: Meteor.users,
          options: "{'createdAt': 1, 'username': 1, 'service': 1, 'profile.name': 1, " +
            "'profile.gender': 1, 'profile.birthday': 1, 'profile.avatarUrl': 1}"
        }
      ]
    });
  }
  return this.ready();
});
