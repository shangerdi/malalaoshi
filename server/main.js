Meteor.startup(function () {
  BrowserPolicy.content.allowOriginForAll("meteor.local");
  BrowserPolicy.content.allowFontDataUrl();
  BrowserPolicy.content.allowOriginForAll('s3.cn-north-1.amazonaws.com.cn');
  BrowserPolicy.content.allowOriginForAll('s3-ap-southeast-1.amazonaws.com');
  BrowserPolicy.content.allowOriginForAll('api.pingxx.com');
  BrowserPolicy.content.allowOriginForAll('sissi.pingxx.com');
  BrowserPolicy.content.allowOriginForAll('wappaygw.alipay.com');
  BrowserPolicy.content.allowOriginForAll('www.google-analytics.com');
  BrowserPolicy.content.allowOriginForAll('enginex.kadira.io');
  BrowserPolicy.content.allowOriginForAll('api.map.baidu.com');
  BrowserPolicy.content.allowOriginForAll('*.api.map.baidu.com');
  BrowserPolicy.content.allowOriginForAll('*.map.bdimg.com');
  BrowserPolicy.content.allowOriginForAll('*.bdimg.com');
  BrowserPolicy.content.allowOriginForAll('*.baidu.com');
  BrowserPolicy.content.allowOriginForAll('*.bdstatic.com');
  BrowserPolicy.content.allowEval();
});
