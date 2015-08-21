/* 约课-订单确认界面 - controller */
OrderStepConfirmController = RouteController.extend({
  getTeacherId: function() {
    return Session.get('orderTeacherId');
  },
  waitOn: function(){
    var teacherId = this.getTeacherId();
    if (!teacherId) {
      return null;
    }
    return [
      Meteor.subscribe('teacher', teacherId)
    ];
  },
  data:function(){
    return {teacherId: this.getTeacherId()}
  }
});
