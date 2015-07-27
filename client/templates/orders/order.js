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
        $(e.currentTarget).removeClass("disabled");
        return throwError(error.reason);
      }
      var orderId = (curOrder && curOrder._id)?curOrder._id:result;
      // window.location.href = ("/create_direct_pay_by_user/"+orderId+"?isCordova="+Meteor.isCordova);
      Meteor.call('pingpp_alipay', orderId, function(err, charge_obj) {
        if(err){
          Session.set("orderShowLoading", false);
          $(e.currentTarget).removeClass("disabled");
          return throwError(err.reason);
        }
        console.log(charge_obj);
        pingpp.createPayment(charge_obj, function(pay_result, pay_error){
          Session.set("orderShowLoading", false);
          $(e.currentTarget).removeClass("disabled");
          console.log(pay_error);
          console.log(pay_result);
          if (pay_result == "success") {
              // 只有微信公众账号 wx_pub 支付成功的结果会在这里返回，其他的 wap 支付结果都是在 extra 中对应的 URL 跳转。
          } else if (pay_result == "fail") {
              // charge 不正确或者微信公众账号支付失败时会在此处返回
          } else if (pay_result == "cancel") {
              // 微信公众账号支付取消支付
          }
        });
      });
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
