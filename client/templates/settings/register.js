Template.register.onCreated(function() {
  Session.set('registerErrors', {});
});
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
  if (!param.cellphone) {
    errors.cellphone = "请输入手机号";
    hasError = true;
  } else if (!/^((\+86)|(86))?(1)\d{10}$/.test(param.cellphone)) {
    errors.cellphone = "手机号格式错误";
    hasError = true;
  }
  if (!param.password) {
    errors.password = "请输入密码";
    hasError = true;
  } else if (!/^\S{6,16}$/.test(param.password)) {
    errors.password = "密码格式错误";
    hasError = true;
  }
  if (step=='reg') {
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
Template.register.events({
	'click #getCheckCode': function(e) {
    var cellphone = $("#cellphone").val();
    var password = $("#password").val();
    var params = {cellphone: cellphone, password:password};
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
      console.log(result);
      if (error) {
        // return throwError(error.reason);
        return Session.set('registerErrors', {cellphone: error.reason});
        $theButton.removeAttr("disabled");
      }
      if (result && result.code!=0) {
        alert(result.msg);
        $theButton.removeAttr("disabled");
      }
      // build a timer, after {countdown} seconds, the user can click this button again
      timer = window.setInterval(function(){
        if (countdown<=0) {
          window.clearInterval(timer);
          $theButton.val("重新获取");
          $theButton.removeAttr("disabled");
          return;
        }
        $theButton.val("还有"+countdown+"秒重新获取");
        countdown--;
      },999);
    });
  },
  'click #doRegister': function(e) {
    var cellphone = $("#cellphone").val();
    var password = $("#password").val();
    var checkCode = $("#checkCode").val();
    var params = {cellphone:cellphone, checkCode:checkCode, password:password};
    var errors = validateRegister(params, 'reg');
    if (errors.hasError) {
      return Session.set('registerErrors', errors);
    } else {
      Session.set('registerErrors', {});
    }

    // do register
    Meteor.call('doRegisterViaPhone', params, function(error, result) {
      console.log(result);
      if (error) {
        // return throwError(error.reason);
        return Session.set('registerErrors', {checkCode: error.reason});
      }
      if (result) {
        if (result.code==0) {
          // alert("验证通过");
          Meteor.loginWithPassword(cellphone, password, function(error){
            if (error) {
              return Session.set('registerErrors', {checkCode: error.reason});
            }
            Router.go('settings');
          });
        } else {
          alert(result.msg);
        }
      }
    });
  }
});