var areaOfChina = new AreaOfChina();
Template.settings.onCreated(function() {
  Session.set('settingsErrors', {});
});
Template.settings.onRendered(function() {
  // init area province list
  var cur = areaOfChina.getProvince();
  if (cur) {
    var arrProv = cur.fetch();
    var $proSelect = $("#addressProvince");
    $.each(arrProv, function(i, obj) {
      $proSelect.append('<option value="'+obj.code+'" type="'+(obj.type?obj.type:0)+'">'+obj.name+'</option>');
    });
  }

  var curUser = Meteor.user();
  if (!curUser || !curUser.profile) {
    return;
  }
  // init user's some properties
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
  var userAddress = curUser.profile.address;
  if (userAddress && userAddress.province) {
    if (userAddress.province.code) {
      $("#addressProvince").val(userAddress.province.code);
    }
    if (userAddress.city && userAddress.city.code) {
      var cur = areaOfChina.getSubAreas(userAddress.province.code);
      var $citySelect = $("#addressCity");
      var arrCity = cur.fetch();
      $.each(arrCity, function(i,obj) {
        $citySelect.append('<option value="'+obj.code+'">'+obj.name+'</option>');
      });
      $citySelect.val(userAddress.city.code);
    }
    if (userAddress.district && userAddress.district.code) {
      var cur = areaOfChina.getSubAreas(userAddress.city.code);
      var $distSelect = $("#addressDistrict");
      var arrDist = cur.fetch();
      $.each(arrDist, function(i,obj) {
        $distSelect.append('<option value="'+obj.code+'">'+obj.name+'</option>');
      });
      $distSelect.val(userAddress.district.code);
    }
  }
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
    for (var i=curYear;i>=1950;i--) {
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
      province:{"code":$("#addressProvince").val(), "name":$("#addressProvince").find("option:selected").text(), "type":$("#addressProvince").find("option:selected").attr('type')},
      city:{"code":$("#addressCity").val(), "name":$("#addressCity").find("option:selected").text()},
      district:{"code":$("#addressDistrict").val(), "name":$("#addressDistrict").find("option:selected").text()},
      road:$("#addressRoad").val()
    };
    // console.log(address);
    var profile = {
      headImgUrl: $(curForm).find('[name=headImgUrl]').val(),
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
    // console.log(profile);

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
  'change select.birthday': function(e) {
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
  'change select.address': function(e) {// 地区select组件事件
    var t = e.target;
    if (t.id!='addressProvince' && t.id!='addressCity') {
      return;
    }
    var code = t.value;
    if (t.id=='addressProvince') {
      var cur = areaOfChina.getSubAreas(code);
      var $citySelect = $("#addressCity");
      $citySelect.children(":gt(0)").remove();
      if (!cur){return;}
      var arrCity = cur.fetch();
      $.each(arrCity, function(i,obj) {
        $citySelect.append('<option value="'+obj.code+'">'+obj.name+'</option>');
      });
      var $distSelect = $("#addressDistrict");
      $distSelect.children(":gt(0)").remove();
    } else if (t.id=='addressCity') {
      var cur = areaOfChina.getSubAreas(code);
      var $distSelect = $("#addressDistrict");
      $distSelect.children(":gt(0)").remove();
      if (!cur){return;}
      var arrDist = cur.fetch();
      $.each(arrDist, function(i,obj) {
        $distSelect.append('<option value="'+obj.code+'">'+obj.name+'</option>');
      });
    }
  },
  'click #checkCellphone': function(e) {
    var cellphoneNum = $("#cellphone").val();
    if (!cellphoneNum || !/^((\+86)|(86))?(1)\d{10}$/.test(cellphoneNum)) {
      alert("手机号错误");
      return;
    }

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

  },
  'click .gravatar': function(e) {
    $gravatar = $(e.target);
    $("#headImgUploadFormBox").css("width", "800px");
    $("#headImgUploadFormBox").css("position", "fixed");
    $("#headImgUploadFormBox").css("top", "50px");
    $("#headImgUploadFormBox").css("left", "200px");
    $("#headImgUploadFormBox").css("zIndex", "9999");
    $("#headImgUploadFormBox").css("border", "1px solid black");
    $("#headImgUploadIFrame")[0].onload = function(e) {
      var data = $(e.target.contentWindow.document.body).text();
      var obj = JSON.parse(data);
      if (!obj || typeof obj.code=="undefined") {
        alert("上传失败，请稍后重试！");
      } else {
        if (obj.code==0) {
          var hiUrl = obj.server+obj.path;
          $gravatar.html('<img src="'+hiUrl+'" width="180" height="180">');
          $("#headImgUrl").val(hiUrl);
          $("#headImgUploadFormBox").addClass('hide');
        } else {
          alert(obj.msg);
        }
      }
    };
    $("#uploadHeadImgCancelBtn").click(function(event) {
      $("#headImgUploadFormBox").addClass('hide');
    });
    $("#headImgUploadFormBox").removeClass('hide');
  }
});
