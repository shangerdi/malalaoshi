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


Orders.permit(['insert', 'update']).userOwnOrder().apply();
Orders.permit(['insert', 'update']).ifHasRole('admin').apply();
