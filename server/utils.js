/** sleep(ms [,callback]) */
sleep = Meteor.wrapAsync(function (ms, callback) {
  Meteor.setTimeout(function() {
    callback();
  }, ms);
});
