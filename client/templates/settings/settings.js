Template.settings.onCreated(function() {
  Session.set('settingsErrors', {});
});
Template.settings.onRendered(function() {
  var curUser = Meteor.user();
  if (curUser.profile.birthday) {
    var a = curUser.profile.birthday.split('-');
    $('#birthdayYear').val(a[0]+'年');
    $('#birthdayMonth').val(a[1]+'月');
    $('#birthdayDay').val(a[2]+'日');
  }
  $("input[type=radio][name=gender]").each(function(){
    if(this.value==curUser.profile.gender) {
      this.checked = 'checked';
    } else {
      this.checked = false;
    }
  });
  $("input[type=radio][name=state]").each(function(){
    if(this.value==curUser.profile.state) {
      this.checked = 'checked';
    } else {
      this.checked = false;
    }
  });
});
Template.settings.helpers({
  errorMessage: function(field) {
    return Session.get('settingsErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('settingsErrors')[field] ? 'has-error' : '';
  },
  years: function() {
    var a = [], curYear = new Date().getFullYear();
    for (var i=1950;i<=curYear;i++) {
      a.push({y:i+"年"});
    }
    return a;
  },
  months: function() {
    var a = [];
    for (var i=1;i<=12;i++) {
      a.push({m:i+"月"});
    }
    return a;
  },
  days: function() {
    return getDaysArray();
  }
});
getDaysArray = function() {
  var m = parseInt($('#birthdayMonth').val());
  var a = [], max = 31;
  if (!!m) {
    if (m==4||m==6||m==9||m==11) {
      max = 30;
    } else if (m==2) {
      max = 28;
      var y = parseInt($('#birthdayYear').val());
      if (y%100==0) {
        if (y%400==0) {
          max = 29;
        }
      } else if (y%4==0) {
        max = 29;
      }
    }
  }
  for (var i=1;i<=max;i++) {
    a.push({d:i+"日"});
  }
  return a;
}
Template.settings.events({
  'submit form': function(e) {
    e.preventDefault();
    var curForm = e.target;
    var gender = $(curForm).find('input[name="gender"]:checked').val();
    var birthday = parseInt($('#birthdayYear').val())+'-'+parseInt($('#birthdayMonth').val())+'-'+parseInt($('#birthdayDay').val());
    var state = $(curForm).find('input[name="state"]:checked').val();
    var address = {
      province:$("#addressProvince").val(),
      city:$("#addressCity").val(),
      district:$("#addressDistrict").val()
    };
    var profile = {
      name: $(curForm).find('[name=name]').val(),
      nickname: $(curForm).find('[name=nickname]').val(),
      gender: gender,
      birthday: birthday,
      state: state,
      college: $(curForm).find('[name=college]').val(),
      degree: $(curForm).find('[name=degree]').val(),
      major: $(curForm).find('[name=major]').val(),
      address: address,
      selfIntro: $(curForm).find('[name=selfIntro]').val(),
      motto: $(curForm).find('[name=motto]').val()
    }
    console.log(profile);

    var errors = validateProfile(profile);
    if (errors.hasError) {
      return Session.set('settingsErrors', errors);
    }

    Meteor.call('updateProfile', profile, function(error, result) {
      if (error)
        return throwError(error.reason);

      Router.go('profile');  
    });
  },
  'change select': function(e) {
    var t = e.target;
    if (t.id!='birthdayYear' && t.id!='birthdayMonth') {
      return;
    }
    var m = parseInt($('#birthdayMonth').val());
    if (t.id=='birthdayYear' && m!=2) {
      return;
    }
    var $daySelect = $("#birthdayDay");
    $daySelect.children().remove();
    var days = getDaysArray();
    $.each(days, function(i,day) {
      $daySelect.append('<option>'+day.d+'</option>');
    });
  },
  'click #checkCellphone': function(e) {
    var cellphoneNum = $("#cellphone").val();
    if (!cellphoneNum || !/^((\+86)|(86))?(1)\d{10}$/.test(cellphoneNum)) {
      alert("手机号错误");
      return;
    }

    Meteor.call('sendPhoneCheckCode', cellphoneNum, function(error, result) {
      console.log(result);
      if (error) {
        return throwError(error.reason);
      }
    });
  },
  'click #confirmCheckCode': function(e) {
    var cellphoneNum = $("#cellphone").val();
    var cellphoneCheckCode = $("#cellphoneCheckCode").val();
    if (!cellphoneNum || !/^((\+86)|(86))?(1)\d{10}$/.test(cellphoneNum)) {
      alert("手机号错误");
      return;
    }
    if (!cellphoneCheckCode || !/^\d{6}$/.test(cellphoneCheckCode)) {
      alert("验证码错误");
      return;
    }

    Meteor.call('verifyPhoneCheckCode', cellphoneNum, cellphoneCheckCode, function(error, result) {
      console.log(result);
      if (error) {
        return throwError(error.reason);
      }
      if (result) {
        alert("验证通过");
      }
    });
  }
});
