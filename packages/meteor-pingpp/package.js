Package.describe({
  name: 'zhonglijunyi:meteor-pingpp',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({
  'pingpp': '2.0.6'
});

Cordova.depends({
  'co.airsia.cordova.pingpp': '0.0.1'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.addFiles('meteor-pingpp.js', 'server');
  api.addFiles('pingpp_pay.js', 'client');
  api.export('Pingpp', ['server']);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('zhonglijunyi:meteor-pingpp');
  api.addFiles('meteor-pingpp-tests.js');
});
