var toGetCodeAttr = 'get', gettingCodeAttr = 'getting', countTimer = 0;
var getRole = function() {
  var role = Session.get('selectedRole');
  if (!role) {
    role = 'parent';
  }
  return role;
}
var isForLogin = function($panel) {
  return $panel.hasClass('login-panel');
}
var getName = function($panel) {
  return $panel.find("input[name='name']")[0].value;
}
var isNameOk = function($panel) {
  var val = getName($panel);
  return (val && val.trim());
}
var getCellphone = function($panel) {
  return $panel.find("input[name='cellphone']")[0].value;
}
var isPhoneOk = function($panel) {
  var val = getCellphone($panel);
  return (val && CELLPHONE_REG.test(val));
}
var getCheckCode = function($panel) {
  return $panel.find("input[name='checkCode']")[0].value;
}
var isCheckCodeOk = function($panel) {
  var val = getCheckCode($panel);
  return (val && /^\d{6}$/.test(val));
}
Template.signPanel.onRendered(function(){
  // console.log(this.data);
  if (this.data && this.data.type==='register') {
    $(".sign-panel-outer .sign-panel").css("left", "-50%");
  }
});
Template.signPanel.events({
  'click #go-register-panel': function(e) {
    $(".sign-panel-outer .sign-panel").animate({left: "-50%"}, 'normal');
  },
  'click #go-login-panel': function(e) {
    $(".sign-panel-outer .sign-panel").animate({left: "0%"}, 'normal');
  },
  'click .icon': function(e) {
    var $item = $(e.target).closest(".item"), $input = $item.find("input");
    $input[0].value = '';
    $input.change();
    $(e.target).hide();
  },
  'keyup input, change input, blur input, mousedown input, touchend input': function(e) {
    var name = e.target.name, $panel = $(e.target).closest('.sign-panel');
    if (name==='name' || name==='cellphone') {
      var ok = false, $getCodeButton = $panel.find(".btn-get-checkcode");
      if (isForLogin($panel)) {
        ok = isPhoneOk($panel);
      } else {
        ok = isNameOk($panel) && isPhoneOk($panel);
      }
      if (ok) {
        $getCodeButton.attr(toGetCodeAttr, "true");
      } else {
        $getCodeButton.attr(toGetCodeAttr, "false");
      }
    } else {
      var ok = false, $destBtn = $panel.find('input[type="button"].btn-login');
      if (isForLogin($panel)) {
        ok = isPhoneOk($panel) && isCheckCodeOk($panel);
      } else {
        ok = isNameOk($panel) && isPhoneOk($panel) && isCheckCodeOk($panel);
      }
      if (ok) {
        $destBtn.removeAttr('disabled');
      } else {
        $destBtn.attr("disabled",true);
      }
    }
    if (e.target.value) {
      $(e.target).closest(".item").find(".icon").show();
    }
  },
  'click .btn-get-checkcode': function(e) {
    var $theButton = $(e.target), $panel = $(e.target).closest('.sign-panel');
    if ($theButton.attr(gettingCodeAttr) || $theButton.attr(toGetCodeAttr)!='true') {
      return;
    }
    if (isForLogin($panel)) {
      if (!isPhoneOk($panel)) {
        return asyncAlert("手机号填写错误，请确认！");
      }
    } else {
      if (!isNameOk($panel)) {
        return asyncAlert("姓名填写错误，请确认！");
      }
      if (!isPhoneOk($panel)) {
        return asyncAlert("手机号填写错误，请确认！");
      }
    }

    var cellphone = getCellphone($panel);
    var params = {cellphone: cellphone};
    params.purpose = isForLogin($panel)?"login":"reg";
    $theButton.attr(gettingCodeAttr,true);
    // call server's method, send check code to this phone number
    Meteor.call('sendPhoneCheckCode', params, function(error, result) {
      if (error) {
        $theButton.removeAttr(gettingCodeAttr);
        return asyncAlert(error.reason);
      }
      if (result && result.code!=0) {
        $theButton.removeAttr(gettingCodeAttr);
        return asyncAlert(error.reason);
      }
      // build a timer, after {countdown} seconds, the user can click this button again
      var countdown = 60;
      countTimer = window.setInterval(function(){
        if (countdown<=0) {
          window.clearInterval(countTimer);
          $theButton.text("重新获取");
          $theButton.removeAttr(gettingCodeAttr);
          return;
        }
        $theButton.text(countdown+"s");
        countdown--;
      },999);
    });
  },
  'click #doLogin': function(e) {
    var $loginBtn = $(e.target), $panel = $(e.target).closest('.sign-panel');
    if (!isPhoneOk($panel)) {
      return asyncAlert("手机号填写错误，请确认！");
    }
    if (!isCheckCodeOk($panel)) {
      return asyncAlert("验证码填写错误，请确认！");
    }
    var cellphone = getCellphone($panel);
    var checkCode = getCheckCode($panel);
    var params = {cellphone:cellphone, checkCode:checkCode};

    $loginBtn.val("登录中...");
    // do login
    Meteor.call('loginWithPhone', params, function(error, result) {
      if (error) {
        // return throwError(error.reason);
        $loginBtn.val("登录");
        return asyncAlert(error.reason);
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
          IonModal.close();
          Router.go('index');
        } else {
          $loginBtn.val("登录");
          return asyncAlert(result.msg);
        }
      }
    });
  },
  'click #doRegister': function(e) {
    var $regBtn = $(e.target), $panel = $(e.target).closest('.sign-panel');
    if (!isNameOk($panel)) {
      return asyncAlert("姓名填写错误，请确认！");
    }
    if (!isPhoneOk($panel)) {
      return asyncAlert("手机号填写错误，请确认！");
    }
    if (!isCheckCodeOk($panel)) {
      return asyncAlert("验证码填写错误，请确认！");
    }
    var role = getRole();
    var name = getName($panel);
    var cellphone = getCellphone($panel);
    var checkCode = getCheckCode($panel);
    var params = {name:name, role:role, cellphone:cellphone, checkCode:checkCode};

    $regBtn.val("注册中...");
    // do register
    Meteor.call('doRegisterViaPhone', params, function(error, result) {
      // console.log(result);
      if (error) {
        // return throwError(error.reason);
        $regBtn.val("注册");
        return asyncAlert(error.reason);
      }
      if (result) {
        if (result.code==0) {
          // ("验证通过");
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
          IonModal.close();
          Router.go('index');
        } else {
          $regBtn.val("注册");
          return asyncAlert(result.msg);
        }
      }
    });
  }
});
