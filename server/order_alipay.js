var config = {
    partner:'2088101150462017' //合作身份者id，以2088开头的16位纯数字
    ,key:'7d314d22efba4f336fb187697793b9d2'//安全检验码，以数字和字母组成的32位字符
    ,seller_email:'sandbox_xiaoyi2@qq.com' //卖家支付宝帐户 必填
    ,host:'http://localhost:3000/'
  ,cacert:'cacert.pem'//ca证书路径地址，用于curl中ssl校验
  ,transport:'http' //访问模式,根据自己的服务器是否支持ssl访问，若支持请选择https；若不支持请选择http
  ,input_charset:'utf-8'//字符编码格式 目前支持 gbk 或 utf-8
};

// init
var mllsAlipay = new Alipay.Alipay(config);
mllsAlipay.on('verify_fail', function(){console.log('emit verify_fail')})
  .on('create_direct_pay_by_user_trade_finished', function(out_trade_no, trade_no){console.log('emit trade_finished'+": "+out_trade_no+","+trade_no)})
  .on('create_direct_pay_by_user_trade_success', function(out_trade_no, trade_no){console.log('emit trade_success'+": "+out_trade_no+","+trade_no)})

/**
 * general function
 */
generateTradeNo = function() {
  var now = new Date(), r=parseInt(Math.random()*1000000);
  return moment(now).format('YYYYMMDDHHmmssSSS')+(r<100000?r+100000:r);
}

create_direct_pay_by_user = function(order, req, res){
  var outTradeNo = generateTradeNo();
  console.log(outTradeNo);
  var data = {
     out_trade_no:outTradeNo 
    ,subject:'体验课程' 
    ,total_fee:'0.01' 
    ,body: '麻辣老师-体验课程测试'
    ,show_url:config.host+'/order/'+order._id
   };   
  
  mllsAlipay.create_direct_pay_by_user(data, res);    
}

var send = function(content) {
  this.writeHead(200, {'Content-Type': 'text/html;charset:utf-8'});
  this.write('<meta charset="utf-8">');
  this.end(content, 'utf8');
}

/**
 * routers config
 */
Router.route('/create_direct_pay_by_user/:_orderId', function () {
  var req = this.request, res = this.response;
  res.send = send;
  var orderId = this.params._orderId;
  var order = Orders.findOne(orderId);
  if (!order) {
    res.send("订单不存在了，呃呃！");
    return;
  }
  create_direct_pay_by_user(order, req, res);
}, {where: 'server'});

// 同步通知
Router.route('/alipay/create_direct_pay_by_user/return_url', function () {
  var req = this.request, res = this.response;
  res.send = send;
  mllsAlipay.create_direct_pay_by_user_return(req, res);
}, {where: 'server'});

// 异步通知
Router.route('/alipay/create_direct_pay_by_user/notify_url', function () {
  var req = this.request, res = this.response;
  res.send = send;
  mllsAlipay.create_direct_pay_by_user_notify(req, res);
}, {where: 'server'});