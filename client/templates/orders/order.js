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
        return throwError(error.reason);
      }
      var orderId = (curOrder && curOrder._id)?curOrder._id:result;
      window.location.href = ("/create_direct_pay_by_user/"+orderId);
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
