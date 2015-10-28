var timeTick = new Tracker.Dependency();
Meteor.setInterval(function () {
    timeTick.changed();
}, 20000);
fromNowReactive = function (mmt) {
  timeTick.depend();
  return mmt.fromNow();
}
Template.registerHelper('created', function(){
  return fromNowReactive(moment(this.createdAt));
});
Template.registerHelper('site', function(){
  return SITE_NAME;
});

Template.registerHelper('isCordova', function(){
  return Meteor.isCordova;
});
Template.registerHelper('platform', function(){
  if (Meteor.isCordova) {
    return 'cordova';
  }
  return 'browser';
});
Template.registerHelper('activeRouteClass', function(/* route names */) {
  var args = Array.prototype.slice.call(arguments, 0);
  args.pop();

  var activeTab = _.any(args, function(name) {
    return Router.current() && Router.current().route.getName() === name
  });

  return activeTab && 'active';
});

Template.registerHelper('runEnv', function() {
  var host = window.location.hostname;
  if (host.match('(localhost|127\.0\.0\.1|.*\.local)')) {
    return 'Dev';
  }
  else if (host.match('stage\..*')) {
    return 'Stage';
  }
  return 'Beta';
});

formatDate = function(datetime, pattern) {
  var momentObj = moment(parseInt(datetime));
  if (!momentObj.isValid()) {
    return datetime;
  }
  if (!pattern || !_.isString(pattern)) {
    pattern = 'YYYY年M月D日';
  }
  return momentObj.format(pattern);
}

Template.registerHelper('formatDate', function(datetime, pattern) {
  return formatDate(datetime, pattern);
});

Template.registerHelper('convMinutes2Str', function(mins) {
  return ScheduleTable.convMinutes2Str(mins);
});

appSetDefaultCity = function() {
  Session.set("locationDefaultCity", "北京市");
};

mapCallbackFunction = function() { // 地图定位后callback方法
}

genScoreStarsAry = function(val, max){
  var ret = [];
  if(typeof val != 'number'){
    return ret;
  }
  var intNum = parseInt(val);
  var noInteger = val != intNum ? true : false;
  for(var i=0; i< max; i++){
    if(i<intNum){
      ret[ret.length] = 3;    //star
    }else{
      if(noInteger){
        noInteger = false;
        ret[ret.length] = 2;  //ion-ios-star-half
      }else{
        ret[ret.length] = 1;  //star-outline
      }
    }
  }
  return ret;
}
logoutButtonHandler = function(e) {
  var doLogout = function() {
    // console.log(Meteor.userId() + ' logout!');
    Meteor.logout();
    Router.go('home');
  };
  // if (Meteor.isCordova) {
    IonActionSheet.show({
      titleText: "确定要退出登录吗？",
      buttons: [
        { text: '退出登录' }
      ],
      destructiveText: false,
      cancelText: '取消',
      cancel: function() {
      },
      buttonClicked: function(index) {
        if (index === 0) {
          IonActionSheet.close(function(){
            doLogout();
          });
          return false;
        }
        return true;
      },
      destructiveButtonClicked: function() {
        return true;
      }
    });
  // } else {
  //   doLogout();
  // }
}

Template.registerHelper('starImage', function(val){
  return val == 3 ? "star_h.png" : val == 2 ? "star_half.png" : val == 1 ? "star_normal.png" : "";
});

asyncAlert = function(msg, callback, num) {
  if (_.isNumber(callback)) {
    var tmp = num;
    num = callback;
    callback = tmp;
  }
  if (!num || !_.isNumber(num)) {
    num = 800;
  }
  IonPopup.show({
    'template': ""+msg,
    'buttons': []
  });
  setTimeout(function () {
    IonPopup.close();
    if (_.isFunction(callback)) {
      setTimeout(callback, 0);
    }
  }, num);
}

//display as YUAN, 2 decimal places
convCent2Yuan = function(cents) {
  return (cents / 100).toFixed(2);
};

Template.registerHelper('convCent2Yuan', function(cents) {
  return convCent2Yuan(cents);
});
