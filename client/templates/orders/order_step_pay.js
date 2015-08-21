var getOrderId = function() {
  return Router.current().params.orderId;
}
var calcToPayCost = function() {
  var orderId = getOrderId(), curOrder = Orders.findOne({"_id": orderId});
  var discountSum = 0;
  if (curOrder.discount && curOrder.discount.sum) {
    discountSum = curOrder.discount.sum;
  }
  return curOrder.cost-discountSum;
}
Template.orderStepPay.onCreated(function(){
  Session.set("orderId", getOrderId());
});
Template.orderStepPay.helpers({
  toPayCost: function() {
    return calcToPayCost();
  }
});
Template.orderStepPay.events({
  'click .item-radio': function(e) {
    var ele = e.target, $ele = $(ele).closest(".item-radio");
    $ele.find("input")[0].click();
  },
  'click #callPayment': function(e) {
    var orderId = getOrderId();
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
