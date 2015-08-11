Meteor.startup(function () {
  moment.locale('zh-cn');

  if (Meteor.isCordova) {
    window.plugins.jPushPlugin.init();
  }

});
