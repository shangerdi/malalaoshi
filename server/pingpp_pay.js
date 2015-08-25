var pingpp = Pingpp(Meteor.settings.PingPPApiKey);
var Fiber = Npm.require('fibers');
var crypto = Npm.require('crypto');

Meteor.methods({
  pingpp_alipay: function(params) {
    var orderId =params.orderId, isCordova = params.isCordova;
    var order = Orders.findOne(orderId);
    if (!order || 'submited'!=order.status) {
      throw new Meteor.Error('Data Not Found', "订单不存在了，或已经完成支付，呃呃！");
      return;
    }
    // 检测老师的时间安排
    try {
      var student = Meteor.user(), teacher = Meteor.users.findOne({'_id':order.teacher.id}), lessonCount = order.hour, phases = order.phases;
      if (phases && _.isArray(phases)) {
        ScheduleTable.generateReserveCourseRecords(student, teacher, lessonCount, phases, true);
      }
    } catch (ex) { // 没有异常即表示时间安排没有冲突
      throw ex;
    }
    // 支付参数
    var total_fee = Orders.getOrderPayAmount(order)*100; // RMB: currency is cny, unit is fen(penny)
    var channel = 'alipay_wap', extra = {};
    if (params.channel === 'alipay') {
      if (isCordova) {
        channel = 'alipay';
      } else {
        channel = 'alipay_wap';
      }
    } else if (params.channel === 'weixin') {
      if (isCordova) {
        channel = 'wx';
      } else {
        channel = 'wx_pub';
      }
    }
    switch (channel) {
      case 'alipay_wap':
        extra = {
          'success_url': ((isCordova?"http://meteor.local/":Meteor.absoluteUrl())+'pingpp/alipay_wap'),
          'cancel_url': ((isCordova?"http://meteor.local/":Meteor.absoluteUrl())+'order/'+orderId)
        };
        break;
    }
    var clientIp = this.connection.clientAddress;
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
        app: {id: Meteor.settings.PingPPAppId},
        channel: channel,
        subject: order.className,
        body: order.className + order.subject,
        amount: total_fee,
        currency: "cny",
        client_ip: clientIp,
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
        updateOrderStatusPaid(orderId);
      }
    }
    return true;
  }
});

var updateOrderStatusPaid = function(orderId) {
  var order = Orders.findOne({'_id': orderId});
  if (order.status==='submited') {
    Orders.update({_id: orderId, status: "submited"}, {$set: {"status": "paid"}});
    // 后面安排课程时间
    try {
      var student = Meteor.users.findOne({'_id':order.student.id}), teacher = Meteor.users.findOne({'_id':order.teacher.id}), lessonCount = order.hour, phases = order.phases;
      doReserveCourses(student, teacher, lessonCount, phases);
    } catch(ex) {
      console.log(ex);
    }
  }
}

// 验证 webhooks 签名
var pingpp_verify_signature = function(raw_data, signature) {
  var verifier = crypto.createVerify('RSA-SHA256').update(raw_data, "utf8");
  return verifier.verify(Meteor.settings.PingPPPublicKey, signature, 'base64');
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
  var raw_data = req.bodyRawData; // 请求的原始数据
  var signature = req.headers['x-pingplusplus-signature']; // 签名在头部信息的 x-pingplusplus-signature 字段
  if (typeof raw_data !== 'string' || typeof signature !== 'string') {
    return send('TODO', 200);
  }

  if (!pingpp_verify_signature(raw_data, signature)) {
    console.log('raw_data:'+raw_data);
    console.log('signature:'+signature);
    console.log('verify fail');
    return send('verify fail', 200);
  }
  var eventObj = req.body, dataObj = eventObj.data?eventObj.data.object||{}:{};
  switch (eventObj.type) {
    case "charge.succeeded": // 对支付异步通知的处理代码
      var orderNo = dataObj.order_no;
      if (dataObj.paid && orderNo) {
        updateOrderStatusPaid(orderId);
      }
      console.log('Order paid: '+orderNo);
      return send('OK');
      break;
    default:
      return send('未知 Event 类型', 400);
      break;
  }
}, {where: 'server', name: 'pingppWebhooks'});
