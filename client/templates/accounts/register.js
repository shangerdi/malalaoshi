Template.register.onCreated(function() {
  Session.set('registerErrors', {});
});
Template.register.onRendered(function() {
  var role = Router.current().params.query.role;
  if (!role) {
    role = Session.get('selectedRole');
  }
  if (!role) {
    role = 'parent';
  }
  selectRole(role);
});
var selectRole = function(role) {
  $("input[name=role]").val(role);
  Session.set('selectedRole', role);
  $(".role-select li.active").removeClass('active');
  $(".role-select li.tab-"+role).addClass('active');
}
Template.register.helpers({
  errorMessage: function(field) {
    return Session.get('registerErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('registerErrors')[field] ? 'has-error' : '';
  }
});
validateRegister = function (param, step) {
  var errors = {}, hasError = false;
  if (!param.name) {
    errors.name = "请输入姓名";
    hasError = true;
  }
  if (!param.cellphone) {
    errors.cellphone = "请输入手机号";
    hasError = true;
  } else if (!CELLPHONE_REG.test(param.cellphone)) {
    errors.cellphone = "手机号格式错误";
    hasError = true;
  }
  // if (!param.password) {
  //   errors.password = "请输入密码";
  //   hasError = true;
  // } else if (!/^\S{6,16}$/.test(param.password)) {
  //   errors.password = "密码格式错误";
  //   hasError = true;
  // }
  if (step=='reg') {
    if (!param.checkCode) {
      errors.checkCode = "请输入验证码";
      hasError = true;
    } else if (!/^\d{6}$/.test(param.checkCode)) {
      errors.checkCode = "验证码错误";
      hasError = true;
    }
    if (!$("#agreement").is(":checked")) {
      errors.agreement = "请阅读并同意用户协议";
      hasError = true;
    }
  }
  errors.hasError = hasError;
  return errors;
}
Template.register.events({
  'click .role-select li>a': function(e) {
    var ele = e.target, role = $(ele).attr("name");
    selectRole(role);
  },
  'keyup #cellphone, change #cellphone': function(e) {
    var val = e.target.value, $getCodeButton = $("#getCheckCode");
    if (CELLPHONE_REG.test(val)) {
      $getCodeButton.removeAttr('disabled');
    } else {
      $getCodeButton.attr("disabled",true);
    }
  },
  'keyup #checkCode, change #checkCode, click #agreement': function(e) {
    var checkCode = $("#checkCode").val(), isAgree = $("#agreement").is(":checked"), $destBtn = $("#doRegister");
    if (/^\d{6}$/.test(checkCode) && isAgree) {
      $destBtn.removeAttr('disabled');
    } else {
      $destBtn.attr("disabled",true);
    }
  },
	'click #getCheckCode': function(e) {
    var name = $.trim($("#name").val());
    var cellphone = $("#cellphone").val();
    var password = $("#password").val();
    var params = {name:name, cellphone: cellphone, password:password};
    var errors = validateRegister(params);
    if (errors.hasError) {
      return Session.set('registerErrors', errors);
    } else {
      Session.set('registerErrors', {});
    }
    
    params.purpose = "reg";
    var $theButton = $(e.target), timer, countdown = 60;
    $theButton.attr("disabled",true);
    // call server's method, send check code to this phone number
    Meteor.call('sendPhoneCheckCode', params, function(error, result) {
      // console.log(result);
      if (error) {
        // return throwError(error.reason);
        $theButton.removeAttr("disabled");
        return Session.set('registerErrors', {cellphone: error.reason});
      }
      if (result && result.code!=0) {
        $theButton.removeAttr("disabled");
        return Session.set('registerErrors', {cellphone: result.msg});
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
  'click #doRegister': function(e) {
    var role = $("#role").val();
    var name = $.trim($("#name").val());
    var cellphone = $("#cellphone").val();
    var password = $("#password").val();
    var checkCode = $("#checkCode").val();
    var params = {name:name, role:role, cellphone:cellphone, checkCode:checkCode, password:password};
    var errors = validateRegister(params, 'reg');
    if (errors.hasError) {
      return Session.set('registerErrors', errors);
    } else {
      Session.set('registerErrors', {});
    }

    var $regBtn = $(e.target);
    $regBtn.val("注册中...");
    // do register
    Meteor.call('doRegisterViaPhone', params, function(error, result) {
      // console.log(result);
      if (error) {
        // return throwError(error.reason);
        $regBtn.val("注册");
        return Session.set('registerErrors', {checkCode: error.reason});
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
          Router.go('index');
        } else {
          $regBtn.val("注册");
          return Session.set('registerErrors', {checkCode: result.msg});
        }
      }
    });
  }
});
