TeacherProceedsController = RouteController.extend({
  waitOn:function() {
    return Meteor.subscribe('proceeds');
  }
});