App.info({
  id: 'com.malalaoshi.app',
  name: '麻辣老师',
  description: '找到独特的老师，只为独特的你',
  author: 'Malalaoshi Dev Team',
  website: 'https://malalaoshi.com',
  version: '1.0.0'
});

App.icons({
  'android_ldpi': 'resources/icons/icon.png',
  'android_mdpi': 'resources/icons/icon.png',
  'android_hdpi': 'resources/icons/icon.png',
  'android_xhdpi': 'resources/icons/icon.png',
  'iphone': 'resources/icons/icon.png',
  'iphone_2x': 'resources/icons/icon.png',
  'iphone_3x': 'resources/icons/icon.png',
  'ipad': 'resources/icons/icon.png',
  'ipad_2x': 'resources/icons/icon.png'
});

/*
App.launchScreens({
  'iphone': 'resources/icons/icon.png',
  'iphone_2x': 'resources/icons/icon.png',
  'iphone5': 'resources/icons/icon.png',
  'iphone6': 'resources/icons/icon.png',
  'iphone6p_portrait': 'resources/icons/icon.png',
  'iphone6p_landscape': 'resources/icons/icon.png',
  'ipad_portrait': 'resources/icons/icon.png',
  'ipad_portrait_2x': 'resources/icons/icon.png',
  'ipad_landscape': 'resources/icons/icon.png',
  'ipad_landscape_2x': 'resources/icons/icon.png',
  'android_ldpi_portrait': 'resources/icons/icon.png',
  'android_ldpi_landscape': 'resources/icons/icon.png',
  'android_mdpi_portrait': 'resources/icons/icon.png',
  'android_mdpi_landscape': 'resources/icons/icon.png',
  'android_hdpi_portrait': 'resources/icons/icon.png',
  'android_hdpi_landscape': 'resources/icons/icon.png',
  'android_xhdpi_portrait': 'resources/icons/icon.png',
  'android_xhdpi_landscape': 'resources/icons/icon.png'
});
*/

App.configurePlugin('cn.jpush.phonegap.JPushPlugin', {
  'JPUSH_APPKEY': '5d4d4dc079a022deee259fb1',
  'JPUSH_CHANNEL': 'channel1',
  'APS_FOR_PRODUCTION': 0
});
App.configurePlugin('co.airsia.cordova.pingpp', {
  'URL_SCHEME': 'malalaoshi://'
});
App.accessRule("*://s3.cn-north-1.amazonaws.com.cn/*");
App.accessRule("*://s3-ap-southeast-1.amazonaws.com/*");
App.accessRule("*://api.pingxx.com/*");
App.accessRule("*://sissi.pingxx.com/*");
App.accessRule("*://wappaygw.alipay.com/*");
App.accessRule("*://www.google-analytics.com/*");
App.accessRule("*://enginex.kadira.io/*");
App.accessRule("*://*.map.baidu.com/*");
App.accessRule("*://*.map.bdimg.com/*");

App.setPreference('fullscreen', 'false');
App.setPreference('StatusBarOverlaysWebView', 'true');
App.setPreference('android-windowSoftInputMode', 'stateVisible|adjustResize');

App.setPreference('webviewbounce', 'true');
App.setPreference('DisallowOverscroll', 'false');
App.setPreference('AutoHideSplashScreen', 'true');

