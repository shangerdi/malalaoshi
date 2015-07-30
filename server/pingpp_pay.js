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
  pingpp_alipay: function(params) {
    var orderId =params.orderId, isCordova = params.isCordova;
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
          'success_url': ((isCordova?"http://meteor.local/":Meteor.absoluteUrl())+'pingpp/alipay_wap'),
          'cancel_url': ((isCordova?"http://meteor.local/":Meteor.absoluteUrl())+'order/'+orderId)
        };
        break;
    }
    var fiber = Fiber.current, result = null, error = null;
    var callback = function(err, charge) {
        if (err) {
          error = err;
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
      console.log(error);
      throw new Meteor.Error('500', error.message);
    }
    Orders.update({_id: orderId}, {$set: {"chargeId": result.id}});
    return result;
  },
  updateOrderPayStatus: function(orderId) {
    var order = Orders.findOne(orderId);
    if (!order) {
      throw new Meteor.Error('Data Not Found', "订单不存在了，呃呃！");
      return;
    }
    if (order.status==='submited' && order.chargeId) {
      var fiber = Fiber.current, hasPaid = false;
      pingpp.charges.retrieve(order.chargeId, function(err, charge) {
        hasPaid = (charge && charge.paid);
        fiber.run();
      });
      Fiber.yield();
      if (hasPaid) {
        Orders.update({_id: orderId, status: "submited"}, {$set: {"status": "paid"}});
      }
    }
    return true;
  }
});

// 验证 webhooks 签名
var pingpp_verify_signature = function(raw_data, signature) {
  var verifier = crypto.createVerify('RSA-SHA256').update(raw_data, "utf8");
  return verifier.verify(pingpp_public_key, signature, 'base64');
}
// ping++ pay: Webhooks
Router.route('/pingpp/result', function () {
  console.log("debug: /pingpp/result")
  var req = this.request, res = this.response;
  var send = function (msg, http_code) {
    http_code = (typeof http_code === "undefined")?200:http_code;
    res.writeHead(http_code, {"Content-Type":"text/plain;charset=utf-8"});
    if (typeof msg !== "string") {
      msg = JSON.stringify(msg);
    }
    res.end(msg);
  };
  // console.log(req);
  var raw_data = req.body; // 请求的原始数据
  var signature = req.headers['x-pingplusplus-signature']; // 签名在头部信息的 x-pingplusplus-signature 字段
  console.log('raw_data:'+raw_data);
  console.log('signature:'+signature);
  if (typeof raw_data !== 'string' || typeof signature !== 'string') {
    return send('未知 Event 类型', 200);
  }

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
        Orders.update({_id: orderNo, status: "submited"}, {$set: {"status": "paid"}});
      }
      return send('OK');
      break;
    default:
      return send('未知 Event 类型', 400);
      break;
  }
}, {where: 'server'});
