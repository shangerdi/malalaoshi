/* 手机验证码缓存，{_id:cellphone, checkCode, createTime}*/
CheckCodeCache = new Mongo.Collection('checkCodeCache');

Meteor.methods({
  sendPhoneCheckCode: function(regParams) {
    var cellphone = regParams.cellphone;
    if (!CELLPHONE_REG.test(cellphone)) {
      throw new Meteor.Error('参数错误', "手机号错误");
    }
    if (cellphone.length>11) {
      cellphone = cellphone.substr(cellphone.length-11);
    }
    this.unblock();
    if (regParams.purpose == "reg") {
      // check if the phone is registered?
      var oldUser = Meteor.users.findOne({"phoneNo": cellphone});
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
      }
    }
    // generate one 6 numbers checkcode
    if (!checkCode) {
      if (TEST_CELLPHONE_REG.test(cellphone)) {
        checkCode = 111111;
      }
      else{
        checkCode = parseInt(Math.random()*1000000);
        if (checkCode<100000) {// 保证验证码是六位数
          checkCode += parseInt(Math.random()*10)*100000;
        }
      }
      CheckCodeCache.update({_id:cellphone}, {$set:{checkCode:checkCode, createTime:new Date().getTime()}}, {upsert: true});
    }
    // build sms message
    var companyName = "非常公会";
    var apikey = "4094d66bedf5ef7cb3134b4da6c12a0e";
    var smsMsg = "【"+companyName+"】您的验证码是"+checkCode;
    var params = {apikey: apikey, mobile: cellphone, text: smsMsg};
    console.log('Mobile num: <' + cellphone + '>, Check code: <' + checkCode + '>');
    try {
      if (process.env.NODE_ENV === 'development') {
        // the following 4 lines are testing statement
        var ctText = '{"code":0,"msg":"OK","result":{"count":1,"fee":1,"sid":2029448147}}';
        console.log(ctText);
        var ctObj = JSON.parse(ctText);
        return ctObj;
      }
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
    if (!CELLPHONE_REG.test(cellphone)) {
      throw new Meteor.Error('参数错误', "手机号错误");
    }
    if (!checkCode || !/^\d{6}$/.test(checkCode)) {
      return new Meteor.Error('registerErrors', {checkCode:"验证码错误"});
    }
    if (cellphone.length>11) {
      cellphone = cellphone.substr(cellphone.length-11);
    }
    this.unblock();
    // query the checkcode cache data

  },
  doRegisterViaPhone: function(params) {
    var cellphone=params.cellphone, checkCode=params.checkCode, password=params.password;
    if (!CELLPHONE_REG.test(cellphone)) {
      throw new Meteor.Error('参数错误', "手机号错误");
    }
    if (!checkCode || !/^\d{6}$/.test(checkCode)) {
      return new Meteor.Error('registerErrors', {checkCode:"验证码错误"});
    }
    // if (!password || !/^\S{6,16}$/.test(password)) {
    //   throw new Meteor.Error('参数错误', "密码格式错误");
    // }
    if (cellphone.length>11) {
      cellphone = cellphone.substr(cellphone.length-11);
    }
    this.unblock();
    // check if the phone is registered?
    var oldUser = Meteor.users.findOne({"phoneNo": cellphone});
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
    if (!isValid) {
      throw new Meteor.Error('参数错误', "验证码错误");
    }
    CheckCodeCache.remove({_id: cellphone});
    // do create user
    try {
      var role = params.role?params.role:'teacher', name=params.name;
      var userOptions = {"username": cellphone, "phoneNo": cellphone, "role": role, profile:{name:name}};
      userId = Accounts.insertUserDoc(userOptions, userOptions);
      // ont new teacher, to do audit
      if (role=='teacher') {
        var nowTime = Date.now();
        TeacherAudit.update({'userId':userId},{$set:{'submitTime':nowTime}},{'upsert':true});
      }
    } catch (ex) {
      console.log(ex);
      throw new Meteor.Error('系统提示', "处理失败，请稍后重试！");
    }
    var methodInvocation = this;
    var stampedLoginToken = Accounts._getAccountData(methodInvocation.connection.id, 'loginToken');
    if (methodInvocation.userId==userId && stampedLoginToken) {
      return {code:1, msg: "Already Login"};
    }
    // return login token
    var stampedLoginToken = Accounts._generateStampedLoginToken();
    Accounts._insertLoginToken(userId, stampedLoginToken);
    Accounts._setLoginToken(userId, methodInvocation.connection, Accounts._hashLoginToken(stampedLoginToken.token));
    methodInvocation.userId=userId;
    var result = {id: userId,
      token: stampedLoginToken.token,
      tokenExpires: Accounts._tokenExpiration(stampedLoginToken.when)
    };
    return {code:0, msg: "注册成功", result: result};
  },
  loginWithPhone: function(params) {
    var methodInvocation = this;
    var cellphone=params.cellphone, checkCode=params.checkCode;
    if (!CELLPHONE_REG.test(cellphone)) {
      throw new Meteor.Error('参数错误', "手机号错误");
    }
    if (!checkCode || !/^\d{6}$/.test(checkCode)) {
      return new Meteor.Error('registerErrors', {checkCode:"验证码错误"});
    }
    if (cellphone.length>11) {
      cellphone = cellphone.substr(cellphone.length-11);
    }
    this.unblock();

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
    if (!isValid) {
      throw new Meteor.Error('参数错误', "验证码错误");
    }
    CheckCodeCache.remove({_id: cellphone});
    // if the user does not exist, create user
    var userId;
    try {
      // check if the phone is registered?
      var oldUser = Meteor.users.findOne({"phoneNo": cellphone});
      if (oldUser) {
        userId = oldUser._id;
      } else {
        var role = params.role?params.role:'teacher';
        var userOptions = {"username": cellphone, "phoneNo": cellphone, "role": role};
        userId = Accounts.insertUserDoc(userOptions, userOptions);
        // ont new teacher, to do audit
        if (role=='teacher') {
          var nowTime = Date.now();
          TeacherAudit.update({'userId':userId},{$set:{'submitTime':nowTime}},{'upsert':true});
        }
      }
    } catch (ex) {
      console.log(ex);
      throw new Meteor.Error('系统提示', "处理失败，请稍后重试！");
    }
    var stampedLoginToken = Accounts._getAccountData(methodInvocation.connection.id, 'loginToken');
    if (methodInvocation.userId==userId && stampedLoginToken) {
      return {code:1, msg: "Already Login"};
    }
    // return login token
    var stampedLoginToken = Accounts._generateStampedLoginToken();
    Accounts._insertLoginToken(userId, stampedLoginToken);
    Accounts._setLoginToken(userId, methodInvocation.connection, Accounts._hashLoginToken(stampedLoginToken.token));
    methodInvocation.userId=userId;
    var result = {id: userId,
      token: stampedLoginToken.token,
      tokenExpires: Accounts._tokenExpiration(stampedLoginToken.when)
    };
    return {code:0, msg: "OK", result: result};
  }
});
