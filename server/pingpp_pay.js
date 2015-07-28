var pingpp = Pingpp('sk_test_0e1W58PWXvTS94a18GvzTyj5');
var Fiber = Npm.require('fibers');

Meteor.methods({
  pingpp_alipay: function(orderId) {
    var order = Orders.findOne(orderId);
    if (!order || 'submited'!=order.status) {
      throw new Meteor.Error('Data Not Found', "订单不存在了，或已经完成支付，呃呃！");
      return;
    }
    var total_fee = 1; // RMB: currency is cny, unit is fen(penny)
    var channel = 'alipay_wap', extra = {};
    switch (channel) {
      case 'alipay_wap':
        extra = {
          'success_url': Meteor.absoluteUrl('pingpp/alipay_wap/result/success'),
          'cancel_url': Meteor.absoluteUrl('order/'+orderId)
        };
        break;
    }
    var fiber = Fiber.current, result = null, error = null;
    var callback = function(err, charge) {
        if (err) {
          error = new Meteor.Error('500', err.message);
          fiber.run();
          return;
        }
        result = charge;
        fiber.run();
        return charge;
    };
    pingpp.charges.create({
        order_no: orderId,
        app: {id: "app_4eXP8OfP0mzL4SmP"},
        channel: channel,
        subject: "体验课程",
        body: "麻辣老师-体验课程测试",
        amount: total_fee,
        currency: "cny",
        client_ip: "127.0.0.1",
        extra: extra
    }, callback);
    Fiber.yield();
    if (error) {
      throw error;
    }
    return result;
  }
});

// ping++ pay: alipay_wap success url
Router.route('/pingpp/alipay_wap/result/success', function () {
  console.log("debug: /pingpp/alipay_wap/result/success")
  var req = this.request, res = this.response;
  var payResult = req.query.result;
  var orderNo = req.query.out_trade_no;
  console.log("order:"+orderNo+", pay result:"+payResult);
  if (payResult=='success') {
    Orders.update({_id: orderNo}, {$set: {"status": "paid"}});
  }
  // redirect to order page
  res.writeHead(301, {'Location': Router.path('order',{id:orderNo})});
  res.end();
}, {where: 'server'});

// ping++ pay: Webhooks
Router.route('/pingpp/pay/result', function () {
  console.log("debug: /pingpp/pay/result")
  var req = this.request, res = this.response;
  console.log(req.query);
}, {where: 'server'});
