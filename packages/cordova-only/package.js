Package.describe({
  name: 'cordova-only',
  summary: 'For cordova use only',
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');

  api.use([
    'fourseven:scss',
    'meteoric:ionic',
    'meteoric:autoform-ionic'
  ],'web.cordova');

  api.use([
    'fourseven:scss',
    'meteoric:ionic-sass',
    'meteoric:ionicons-sass'
    ],'server');

  api.addFiles(['import_cordova.scss'], ['web.cordova']);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('cordova-only');
  api.addFiles('cordova-only-tests.js');
});
