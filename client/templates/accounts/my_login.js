Template.mylogin.onCreated(function() {
  Session.set('myloginErrors', {});
});
Template.mylogin.helpers({
  errorMessage: function(field) {
    return Session.get('myloginErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('myloginErrors')[field] ? 'has-error' : '';
  }
});
validateLogin = function (param, step) {
  var errors = {}, hasError = false;
  if (!param.cellphone) {
    errors.cellphone = "请输入手机号";
    hasError = true;
  } else if (!CELLPHONE_REG.test(param.cellphone)) {
    errors.cellphone = "手机号格式错误";
    hasError = true;
  }
  if (step=='login') {
    if (!param.checkCode) {
      errors.checkCode = "请输入验证码";
      hasError = true;
    } else if (!/^\d{6}$/.test(param.checkCode)) {
      errors.checkCode = "验证码错误";
      hasError = true;
    }
  }
  errors.hasError = hasError;
  return errors;
}
var timer = 0;
Template.mylogin.events({
  'keyup #cellphone, change #cellphone': function(e) {
    var val = e.target.value, $getCodeButton = $("#getCheckCode");
    if (CELLPHONE_REG.test(val)) {
      $getCodeButton.removeAttr('disabled');
    } else {
      $getCodeButton.attr("disabled",true);
    }
  },
  'keyup #checkCode, change #checkCode': function(e) {
    var val = e.target.value, $destBtn = $("#doLogin");
    if (/^\d{6}$/.test(val)) {
      $destBtn.removeAttr('disabled');
    } else {
      $destBtn.attr("disabled",true);
    }
  },
	'click #getCheckCode': function(e) {
    var cellphone = $("#cellphone").val();
    var params = {cellphone: cellphone};
    var errors = validateLogin(params);
    if (errors.hasError) {
      return Session.set('myloginErrors', errors);
    } else {
      Session.set('myloginErrors', {});
    }

    params.purpose = "login";
    var $theButton = $(e.target), countdown = 60;
    $theButton.attr("disabled",true);
    // call server's method, send check code to this phone number
    Meteor.call('sendPhoneCheckCode', params, function(error, result) {
      if (error) {
        $theButton.removeAttr("disabled");
        // return throwError(error.reason);
        return Session.set('myloginErrors', {cellphone: error.reason});
      }
      if (result && result.code!=0) {
        return Session.set('myloginErrors', {cellphone: result.msg});
        $theButton.removeAttr("disabled");
        return;
      }
      // build a timer, after {countdown} seconds, the user can click this button again
      timer = window.setInterval(function(){
        if (countdown<=0) {
          window.clearInterval(timer);
          $theButton.val("重新获取");
          $theButton.removeAttr("disabled");
          return;
        }
        $theButton.val("重新获取("+countdown+")");
        countdown--;
      },999);
    });
  },
  'click #doLogin': function(e) {
    var cellphone = $("#cellphone").val();
    var checkCode = $("#checkCode").val();
    var params = {cellphone:cellphone, checkCode:checkCode};
    var errors = validateLogin(params, 'login');
    if (errors.hasError) {
      return Session.set('myloginErrors', errors);
    } else {
      Session.set('myloginErrors', {});
    }

    var $loginBtn = $(e.target);
    $loginBtn.val("登录中...");
    // do login
    Meteor.call('loginWithPhone', params, function(error, result) {
      if (error) {
        // return throwError(error.reason);
        $loginBtn.val("登录");
        return Session.set('myloginErrors', {checkCode: error.reason});
      }
      if (result) {
        role = result.role;
        if (result.code==0) {
          result = result.result;
          var loginTokenKey = "Meteor.loginToken";
          var loginTokenExpiresKey = "Meteor.loginTokenExpires";
          var userIdKey = "Meteor.userId";
          var userId = result.id, token = result.token, tokenExpires = result.tokenExpires;
          Meteor._localStorage.setItem(userIdKey, userId);
          Meteor._localStorage.setItem(loginTokenKey, token);
          if (! tokenExpires)
            tokenExpires = Accounts._tokenExpiration(new Date());
          Meteor._localStorage.setItem(loginTokenExpiresKey, tokenExpires);
          Accounts.connection.setUserId(userId);
          Accounts._setLoggingIn(true);
        } else {
          $loginBtn.val("登录");
          return Session.set('myloginErrors', {checkCode: result.msg});
        }
        Router.go('index');
      }
    });
  }
});
