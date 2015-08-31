var getTeacherId = function() {
  return Session.get("orderTeacherId");
}
var getCourseCount = function() {
  var courseCount = Session.get("courseCount");
  return courseCount?courseCount:0;
}
Template.order.onRendered(function () {
  IonNavigation.skipTransitions = true;
  Session.set("orderShowLoading", false);
});
Template.order.helpers({
  showLoading: function(){
    return Session.get("orderShowLoading");
  },
  phoneNum: function(){
    if(this.order && this.order.student && this.order.student.phoneNo){
      var pn = this.order.student.phoneNo.toString();
      var lth = pn.length;
      var a = lth < 3 ? lth : 3;
      var b = lth < 7 ? lth : 7;
      return pn.substring(0, a) + "****" + pn.substring(b, lth);
    }
  },
  timePhases: function() {
    return Session.get("phases");
  },
  convMinutes2Str: function(mins) {
    return ScheduleTable.convMinutes2Str(mins);
  },
  weekdayText: function(d) {
    return '每周'+ScheduleTable.dayNumWords[d];
  },
  courseCount: function() {
    return getCourseCount();
  },
  subject: function(){
    return this.order ? this.order.subject : "";
  },
  money: function(val){
    return accounting.formatMoney(val, '');
  },
  formatNum: function(val){
    return accounting.formatNumber(val, 2);
  },
  error: function(){
    return (this.student && this.teacher) ? "" : "disabled";
  }
});

Template.order.events({
  'click #btnSaveAndPay': function(e) {
    e.preventDefault();
    $(e.currentTarget).addClass("disabled");
    Session.set("orderShowLoading", true);

    var curOrder = this.order;
    Meteor.call('updateOrder', curOrder, function(error, result) {
      if(error){
        Session.set("orderShowLoading", false);
        $(e.currentTarget).removeClass("disabled");
        return throwError(error.reason);
      }
      Router.go('orderStepPay', {'orderId': result});
    });
  },
  'click #btnDelete': function(e){
    e.preventDefault();

    if(this.order && this.order._id){
      Meteor.call('deleteOrder', this.order._id, function(error, result) {
        if (error)
          return throwError(error.reason);

        Router.go("orders");
      });
    }
  }
});
