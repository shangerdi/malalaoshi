var getOrderId = function() {
  return Router.current().params.orderId;
}
var calcToPayCost = function() {
  var orderId = getOrderId(), curOrder = Orders.findOne({"_id": orderId});
  return Orders.getOrderPayAmount(curOrder);
}
Template.orderStepPay.onCreated(function(){
  Session.set("orderId", getOrderId());
  Session.set('errors','');
});
Template.orderStepPay.helpers({
  errorMessage: function(field) {
    return Session.get('errors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('errors')[field] ? 'has-error' : '';
  },
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
    var orderId = getOrderId(), errors={hasError:false};
    if (!orderId) {
      alert("订单ID错误");
      return;
    }
    var channel = $("input[name=payType]:checked").val();
    if (!channel) {
      errors.pay="请选择支付方式";
      errors.hasError=true;
    }
    Session.set('errors', errors);
    if (errors.hasError) {
      return;
    }
    var payParams = {'orderId':orderId, 'isCordova':Meteor.isCordova, 'channel': channel};
    Meteor.call('pingpp_alipay', payParams, function(err, charge_obj) {
      if(err){
        // console.log(err);
        Session.set("orderShowLoading", false);
        $(e.currentTarget).removeClass("disabled");
        errors.pay=err.reason;
        Session.set('errors', errors);
        return throwError(err.reason);
      }
      // console.log(charge_obj);
      var pingppObj = Meteor.isCordova?pingpp:pingpp_web;
      pingppObj.createPayment(charge_obj, function(pay_result, pay_error){
        Session.set("orderShowLoading", false);
        $(e.currentTarget).removeClass("disabled");
        // console.log(pay_error);
        // console.log(pay_result);
        if (pay_result == "success") {
            // 只有微信公众账号 wx_pub 支付成功的结果会在这里返回，其他的 wap 支付结果都是在 extra 中对应的 URL 跳转。
            Router.go('pingppResultUrl', {}, {query: 'out_trade_no='+orderId+'&result=success'});
        } else if (pay_result == "fail") {
            // charge 不正确或者微信公众账号支付失败时会在此处返回
        } else if (pay_result == "cancel") {
            // 微信公众账号支付取消支付
        }
      }, function(result){
        // errorCallback
        console.log("In errorCallback(): " + result);  //"fail"|"cancel"|"invalid"
      });
    });
  }
});
