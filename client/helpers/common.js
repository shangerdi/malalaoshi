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

appSetDefaultCity = function() {
  Session.set("locationDefaultCity", "北京市");
};

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
