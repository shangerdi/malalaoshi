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
    return userId !== doc.student.id;
  }
});


Orders.permit(['insert', 'update', 'remove']).userOwnOrder().apply();
Orders.permit(['insert', 'update', 'remove']).ifHasRole('admin').apply();
