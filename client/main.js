Meteor.startup(function () {
  moment.locale('zh-cn');

  window.plugins.jPushPlugin.init();
});
