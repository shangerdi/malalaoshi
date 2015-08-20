Template.orderStepPay.onCreated(function(){
  console.log(Session.get("orderTeacherId"));
});
Template.orderStepPay.events({
  'click #callPayment': function(e) {
    var orderId = Template.instance().data.orderId;
    if (!orderId) {
      alert("订单ID错误");
      return;
    }
    Meteor.call('pingpp_alipay', {'orderId':orderId,'isCordova':Meteor.isCordova}, function(err, charge_obj) {
      if(err){
        // console.log(err);
        Session.set("orderShowLoading", false);
        $(e.currentTarget).removeClass("disabled");
        return throwError(err.reason);
      }
      // console.log(charge_obj);
      pingpp.createPayment(charge_obj, function(pay_result, pay_error){
        Session.set("orderShowLoading", false);
        $(e.currentTarget).removeClass("disabled");
        // console.log(pay_error);
        // console.log(pay_result);
        if (pay_result == "success") {
            // 只有微信公众账号 wx_pub 支付成功的结果会在这里返回，其他的 wap 支付结果都是在 extra 中对应的 URL 跳转。
        } else if (pay_result == "fail") {
            // charge 不正确或者微信公众账号支付失败时会在此处返回
        } else if (pay_result == "cancel") {
            // 微信公众账号支付取消支付
        }
      });
    });
  }
});
