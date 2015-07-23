Security.defineMethod("ifHasRole", {
  fetch: [],
  transform: null,
  deny: function (type, arg, userId, doc) {
    var curUser = Meteor.user();
    return !curUser || _.isEmpty(arg) ? true : curUser.role !== arg;
  }
});

Security.defineMethod("userOwnOrder", {
  fetch: [],
  transform: null,
  deny: function (type, arg, userId, doc) {
    return !doc ? true : userId !== doc.student.id;
  }
});

Security.defineMethod("ownsDocument", {
  fetch: [],
  transform: null,
  deny: function (type, arg, userId, doc) {
    return !doc ? true : userId !== doc.userId;
  }
});

Security.defineMethod("userSelf", {
  fetch: [],
  transform: null,
  deny: function (type, arg, userId, doc) {
    var curUser = Meteor.user();
    return !curUser ? true : curUser._id !== doc._id;
  }
});


Orders.permit(['insert', 'update']).userOwnOrder().apply();
Orders.permit(['insert', 'update']).ifHasRole('admin').apply();

Pages.permit(['update']).ifHasRole('admin').apply();

Messages.permit(['update']).ownsDocument().apply();

UserCertification.permit(['update']).ownsDocument().apply();

UserEducation.permit(['insert', 'update']).ownsDocument().apply();

Areas.permit(['insert', 'update', 'remove']).apply();

Feedbacks.permit(['insert']).ownsDocument().apply();

TeacherAudit.permit(['insert', 'update']).ownsDocument().apply();
TeacherAudit.permit(['insert', 'update']).ifHasRole('admin').apply();

Meteor.users.permit(['update']).userSelf().apply();
Meteor.users.permit(['update']).ifHasRole('admin').apply();
