/* 约课-订单确认界面 - controller */
OrderStepConfirmController = RouteController.extend({
  getTeacherId: function() {
    return Session.get('orderTeacherId');
  },
  getOrderId: function() {
    var orderId = this.params.orderId;
    if (!orderId) {
      orderId = Session.get('orderId');
    }
    return orderId;
  },
  waitOn: function(){
    var orderId = this.getOrderId(), subs = [];
    if (orderId) {
      subs[subs.length] = Meteor.subscribe('order', {'orderId': orderId});
    }
    var teacherId = this.getTeacherId();
    if (teacherId) {
      subs[subs.length] = Meteor.subscribe('teacher', teacherId);
    }
    return subs;
  },
  data:function(){
    return {teacherId: this.getTeacherId(), orderId: this.getOrderId()}
  }
});
