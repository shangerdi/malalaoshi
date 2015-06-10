/* 手机验证码缓存，{_id:cellphone, checkCode, createTime}*/
CheckCodeCache = new Mongo.Collection('checkCodeCache');

Meteor.methods({
  sendPhoneCheckCode: function(regParams) {
    var cellphone = regParams.cellphone;
    if (!cellphone || !/^((\+86)|(86))?(1)\d{10}$/.test(cellphone)) {
      throw new Meteor.Error('参数错误', "手机号错误");
    }
    this.unblock();
    if (regParams.purpose == "reg") {
      // check if the phone is registered?
      var oldUser = Meteor.users.findOne({username: cellphone});
      if (oldUser) {
        return {code:1, msg: "该手机号已经注册过了！"};
      }
    }
    // firstly, query the checkcode cache data, maybe the checkcode for this phone already exists
    var checkCode = 0;
    var cacheData = CheckCodeCache.findOne({_id: cellphone});
    if (cacheData && cacheData.checkCode && cacheData.createTime) {
      var oldtime = cacheData.createTime;
      var now = new Date();
      if (now.getTime()-oldtime<10*60*1000) {
        checkCode = cacheData.checkCode;
        // console.log("re-send");
      }
    }

    // generate one 6 numbers checkcode
    if (!checkCode) {
      checkCode = parseInt(Math.random()*1000000);
      if (checkCode<100000) {// 保证验证码是六位数
        checkCode += parseInt(Math.random()*10)*100000;
      }
      CheckCodeCache.update({_id:cellphone}, {$set:{checkCode:checkCode, createTime:new Date().getTime()}}, {upsert: true});
    }
    // build sms message
    var companyName = "云片网";
    var apikey = "f79c93489861d14ef51299d6322e1569";
    var smsMsg = "【"+companyName+"】您的验证码是"+checkCode;
    var params = {apikey: apikey, mobile: cellphone, text: smsMsg};
    console.log(params);
    try {
      // {
      //   // the following 4 lines are testing statement
      //   var ctText = '{"code":0,"msg":"OK","result":{"count":1,"fee":1,"sid":2029448147}}';
      //   console.log(ctText);
      //   var ctObj = JSON.parse(ctText);
      //   return ctObj;
      // }
      // send the sms message
      var url = "http://yunpian.com/v1/sms/send.json";
      var headers = {"Accept": "text/plain;charset=utf-8;", "Content-Type":"application/x-www-form-urlencoded;charset=utf-8;"};
      var result = HTTP.call("POST", url, {params: params, headers: headers});
      console.log(result.content);
      var ctObj = JSON.parse(result.content);
      return ctObj;
    } catch (ex) {
      // Got a network error, time-out or HTTP error in the 400 or 500 range.
      console.log(ex);
      throw new Meteor.Error('系统提示', "处理失败，请稍后重试！");
    }
  },
  verifyPhoneCheckCode: function(params) {
    var cellphone=params.cellphone, checkCode=params.checkCode
    console.log(cellphone, checkCode);
    if (!cellphone || !/^((\+86)|(86))?(1)\d{10}$/.test(cellphone)) {
      throw new Meteor.Error('参数错误', "手机号错误");
    }
    if (!checkCode || !/^\d{6}$/.test(checkCode)) {
      return new Meteor.Error('registerErrors', {checkCode:"验证码错误"});
    }
    this.unblock();
    // query the checkcode cache data

  },
  doRegisterViaPhone: function(params) {
    var cellphone=params.cellphone, checkCode=params.checkCode, password=params.password;
    console.log(cellphone, checkCode, password);
    if (!cellphone || !/^((\+86)|(86))?(1)\d{10}$/.test(cellphone)) {
      throw new Meteor.Error('参数错误', "手机号错误");
    }
    if (!checkCode || !/^\d{6}$/.test(checkCode)) {
      return new Meteor.Error('registerErrors', {checkCode:"验证码错误"});
    }
    if (!password || !/^\S{6,16}$/.test(password)) {
      throw new Meteor.Error('参数错误', "密码格式错误");
    }
    this.unblock();
    // check if the phone is registered?
    var oldUser = Meteor.users.findOne({username: cellphone});
    if (oldUser) {
      return {code:1, msg: "该手机号已经注册过了！"};
    }

    // query the checkcode cache data
    var isValid = false;
    var cacheData = CheckCodeCache.findOne({_id: cellphone});
    if (cacheData && cacheData.checkCode && cacheData.createTime) {
      var oldtime = cacheData.createTime;
      var now = new Date();
      if (now.getTime()-oldtime<10*60*1000) {
        var cachedCheckCode = cacheData.checkCode;
        if (cachedCheckCode==checkCode) {
          isValid = true;
        }
      }
    }
    console.log(isValid);
    if (!isValid) {
      throw new Meteor.Error('参数错误', "验证码错误");
    }
    CheckCodeCache.remove({_id: cellphone});
    // do create user
    try {
      var userOptions = {username: cellphone, password: password};
      Accounts.createUser(userOptions);
    } catch (ex) {
      console.log(ex);
      throw new Meteor.Error('系统提示', "处理失败，请稍后重试！");
    }
    return {code:0, msg: "注册成功"};
  }
});
