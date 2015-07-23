var myRsaPrivate = '-----BEGIN RSA PRIVATE KEY-----\n'
  +'MIICXQIBAAKBgQCpidSSiOVoH/UA5+7ycAl7tuQ9en61kgb6AP5gqAnABZHRFF19\n'
  +'EsheIxJKKiVwg2d46HU50LxTMgeiFigcWtf1yiBBzXaq3ozv2qFZvcWOy3Uwxk1R\n'
  +'r6whHGbpIaWwj497IYETLrNHt52x6Nyk+4PyZwdNFq5s774ZPvc784g5xwIDAQAB\n'
  +'AoGAIMayv/mTUEQNW7V7LoeWbcJ38aLC6Fto2eBjTVBvQh5RiHhFcq606e4h1RC8\n'
  +'2DmvQWK/dwPxxKvBagaajpDJezyDOR0d778cgFenCW8iZ7/g/EABPqHWFUiQ71Yg\n'
  +'+AvsL+SBUhEgaKgSmteiptA2vkp/Hb96YNR/+bBloMzKCkECQQDbz+XvTkXfjaPR\n'
  +'7EF05OrmaPj14OCNXpKKir5JgBmNqj/URY3XuwvzqO180wicemCZEmJIt8NSnP4a\n'
  +'b+Y9vS5RAkEAxXMeju6hbcwwWYpwnk7xWxJbmQf4AIu51hGC1jNydVfhNn9RZz7V\n'
  +'uCvUA/2uQWzttpIwinm/auxd2k76ftFolwJBAJalRe2bFFIg7XwqUbX+SWq92JoS\n'
  +'k3LvtLjUW5NeAqVPX81oGc0W+Rr11EUvEIDFcjyWF9vEbU3KIHAX7pCzffECQEak\n'
  +'4ZISHv/BxqrCtXhuljwXXV5rU3gehebpbP5medUyFAoDk4R1HtI+HCUxZl9SMdrY\n'
  +'gzWIScxftVSeXVFyaxECQQDGGk4JKAw4z6y1ZJZcZ6HOAjfXGAGoyNfQJYZSoOYa\n'
  +'d5zEmFWs4uaBRmoMkeM9S+UC532b41dHAUc6uIFqT2Ye\n'
  +'-----END RSA PRIVATE KEY-----';
var config = {
    partner:'2088101150462017' //合作身份者id，以2088开头的16位纯数字
    ,key:'7d314d22efba4f336fb187697793b9d2'//安全检验码，以数字和字母组成的32位字符
    ,seller_email:'sandbox_xiaoyi2@qq.com' //卖家支付宝帐户 必填
    ,host:'http://localhost:3000/'
  ,cacert:'cacert.pem'//ca证书路径地址，用于curl中ssl校验
  ,transport:'http' //访问模式,根据自己的服务器是否支持ssl访问，若支持请选择https；若不支持请选择http
  ,input_charset:'utf-8'//字符编码格式 目前支持 gbk 或 utf-8,
  // my私钥，pkcs8格式
  ,my_rsa_private:myRsaPrivate
};

// init
var crypto = Npm.require('crypto');
var url = Npm.require('url');
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

alipay_create_direct_pay_by_user = function(order, req, res){
  var outTradeNo = generateTradeNo();
  console.log(outTradeNo);
  var data = {
     out_trade_no:outTradeNo 
    ,seller_id:mllsAlipay.alipay_config.partner
    ,subject:'体验课程' 
    ,total_fee:'0.01' 
    ,body: '麻辣老师-体验课程测试'
    ,show_url:config.host+'/order/'+order._id
   };   
  
  mllsAlipay.create_direct_pay_by_user(data, res);    
}

alipay_create_alipay_wap_create_direct_pay_by_user = function(order, req, res) {
  var outTradeNo = generateTradeNo();
  console.log(outTradeNo);
  var data = {
     out_trade_no:outTradeNo 
    ,seller_id:mllsAlipay.alipay_config.partner
    ,subject:'体验课程' 
    ,total_fee:'0.01' 
    ,body: '麻辣老师-体验课程测试'
    ,show_url:config.host+'/order/'+order._id
   };
  //建立请求
  var _pay = mllsAlipay;
  var alipaySubmit = new Alipay.AlipaySubmit(_pay.alipay_config);

  var parameter = {
    service:'alipay.wap.create.direct.pay.by.user'
    ,partner:_pay.alipay_config.partner
    ,payment_type:'1' //支付类型
    ,notify_url: url.resolve(_pay.alipay_config.host, _pay.alipay_config.create_direct_pay_by_user_notify_url)//服务器异步通知页面路径,必填，不能修改, 需http://格式的完整路径，不能加?id=123这类自定义参数
    ,return_url: url.resolve(_pay.alipay_config.host , _pay.alipay_config.create_direct_pay_by_user_return_url)//页面跳转同步通知页面路径 需http://格式的完整路径，不能加?id=123这类自定义参数，不能写成http://localhost/
    ,seller_email:_pay.alipay_config.seller_email //卖家支付宝帐户 必填    
    ,_input_charset:_pay.alipay_config['input_charset'].toUpperCase().trim()
  };
  for(var key in data){
    parameter[key] = data[key];
  }
  
  var html_text = alipaySubmit.buildRequestForm(parameter,"get", "确认");
  res.send(html_text);
}

alipay_create_mobile_securitypay_pay = function(order, req, res) {
  var outTradeNo = generateTradeNo();
  console.log(outTradeNo);
  var data = {
     out_trade_no:outTradeNo 
    ,seller_id:mllsAlipay.alipay_config.partner
    ,subject:'体验课程' 
    ,total_fee:'0.01' 
    ,body: '麻辣老师-体验课程测试'
    ,show_url:config.host+'/order/'+order._id
   };
  //建立请求
  var _pay = mllsAlipay;
  var alipaySubmit = new Alipay.AlipaySubmit(_pay.alipay_config);

  var para = {
    service:'mobile.securitypay.pay'
    ,partner:_pay.alipay_config.partner
    ,payment_type:'1' //支付类型
    ,notify_url: url.resolve(_pay.alipay_config.host, _pay.alipay_config.create_direct_pay_by_user_notify_url)//服务器异步通知页面路径,必填，不能修改, 需http://格式的完整路径，不能加?id=123这类自定义参数
    // ,return_url: url.resolve(_pay.alipay_config.host , _pay.alipay_config.create_direct_pay_by_user_return_url)//页面跳转同步通知页面路径 需http://格式的完整路径，不能加?id=123这类自定义参数，不能写成http://localhost/
    ,seller_email:_pay.alipay_config.seller_email //卖家支付宝帐户 必填    
    ,_input_charset:_pay.alipay_config['input_charset'].toUpperCase().trim()
  };
  for(var key in data){
    para[key] = data[key];
  }
  //签名类型，目前仅支持 RSA。
  var ls = '';
  for(var k in para){
    ls = ls + k + '="' + para[k] + '"&';
  }
  ls = ls.substring(0, ls.length - 1);
  var sign_type = 'RSA';
  var signer = crypto.createSign('RSA-SHA1');
  signer.update(ls);
  var mysign = signer.sign(myRsaPrivate,'base64');
  ls = ls + '&sign="' + mysign + '"&sign_type="'+sign_type+'"';
  var html_text = '<script>window.location.href=\'alipays://platformapi/startapp?'+ls+'\';</script>';
  res.send(html_text);
}


// to extend response end function
var send = function(content) {
  this.writeHead(200, {'Content-Type': 'text/html;charset:utf-8'});
  this.write('<meta charset="utf-8">');
  this.end(content, 'utf8');
}

/**
 * routers config
 */
Router.route('/create_direct_pay_by_user/:_orderId?', function () {
  var req = this.request, res = this.response;
  var isCordova = req.query.isCordova;
  console.log(isCordova);
  res.send = send;
  var orderId = this.params._orderId;
  var order = Orders.findOne(orderId);
  if (!order) {
    res.send("订单不存在了，呃呃！");
    return;
  }
  if (isCordova && isCordova.toString()==="true") {
    alipay_create_mobile_securitypay_pay(order, req, res);
  } else {
    alipay_create_direct_pay_by_user(order, req, res);
  }
}, {where: 'server'});

// 同步通知
Router.route('/alipay/create_direct_pay_by_user/return_url', function () {
  console.log("debug: /alipay/create_direct_pay_by_user/return_url")
  var req = this.request, res = this.response;
  res.send = send;
  mllsAlipay.create_direct_pay_by_user_return(req, res);
}, {where: 'server'});

// 异步通知
Router.route('/alipay/create_direct_pay_by_user/notify_url', function () {
  console.log("debug: /alipay/create_direct_pay_by_user/notify_url")
  var req = this.request, res = this.response;
  res.send = send;
  mllsAlipay.create_direct_pay_by_user_notify(req, res);
}, {where: 'server'});