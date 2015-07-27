var pingpp = Pingpp('sk_test_0e1W58PWXvTS94a18GvzTyj5');
var Fiber = Npm.require('fibers');

Meteor.methods({
  pingpp_alipay: function(orderId) {
    var order = Orders.findOne(orderId);
    if (!order) {
      throw new Meteor.Error('Data Not Found', "订单不存在了，呃呃！");
      return;
    }
    var fiber = Fiber.current, result = null;
    var callback = function(err, charge) {
        if (err) {
          fiber.run();
          throw new Meteor.Error('500', err.message);
        }
        result = charge;
        fiber.run();
        return charge;
    };
    pingpp.charges.create({
        subject: "Your Subject",
        body: "Your Body",
        amount: 1,
        order_no: "123456789",
        channel: "alipay_wap",
        currency: "cny",
        client_ip: "127.0.0.1",
        app: {id: "app_4eXP8OfP0mzL4SmP"}
    }, callback);
    Fiber.yield();
    return result;
  }
});