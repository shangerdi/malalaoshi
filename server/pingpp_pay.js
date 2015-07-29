var pingpp = Pingpp('sk_test_0e1W58PWXvTS94a18GvzTyj5');
var Fiber = Npm.require('fibers');
var crypto = Npm.require('crypto');
var pingpp_public_key = '-----BEGIN PUBLIC KEY-----'
    +'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA63ies43K5pgEQdnr8uIB'
    +'gBB54Ht3pMm9HdV8/w6w3RlNDpIaQYQjqURiEzb2JUJmdPqNZ904luMo5Dd8wNbT'
    +'/lF/ooe5s5Scm08+ja84yE7mT2fxJyvMzT2qSTlDBp84iW+rAspRu3bTDQjWuWyH'
    +'ghMYTIvAEgv7lRtoN18F8gVeCIjrN++a2M8m4mucOyCXH1HJZYMs4CuTuydnsJdn'
    +'GT1f+ILzQkOcHj236WCtP55OryVOwZXScZnAZKkx21gSZayW3YNNA8aWh21R/tc3'
    +'B3o4f+GRCRnrGW58FERhOzwqTKgnOYPTnk50Et28XRXEHoZa3wyTZA1ivP5As4T6'
    +'6wIDAQAB'
    +'-----END PUBLIC KEY-----';

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

// 验证 webhooks 签名
var pingpp_verify_signature = function(raw_data, signature) {
  var verifier = crypto.createVerify('RSA-SHA256').update(raw_data, "utf8");
  return verifier.verify(pingpp_public_key, signature, 'base64');
}
// ping++ pay: Webhooks
Router.route('/pingpp/pay/result', function () {
  console.log("debug: /pingpp/pay/result")
  var req = this.request, res = this.response;
  console.log(req.query);
  var raw_data = body; // 请求的原始数据
  var signature = req.headers['x-pingplusplus-signature']; // 签名在头部信息的 x-pingplusplus-signature 字段

  if (pingpp_verify_signature(raw_data, signature)) {
    console.log('verification succeeded');
  } else {
    console.log('verification failed');
    return;
  }
  var eventObj = req.query, dataObj = eventObj.data.object;
  switch (eventObj.type) {
    case "charge.succeeded": // 对支付异步通知的处理代码
      var orderNo = dataObj.order_no;
      if (eventObj.paid && orderNo) {
        Orders.update({_id: orderNo}, {$set: {"status": "paid"}});
      }
      res.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
      return res.end('OK');
      break;
    default:
      res.writeHead(400, {"Content-Type": "text/plain; charset=utf-8"});
      return res.end('未知 Event 类型');
      break;
  }
}, {where: 'server'});
