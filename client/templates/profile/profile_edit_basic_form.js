var areaOfChina = new AreaOfChina();
Template.profileEditBasicForm.helpers({
  //add you helpers here
  errorMessage: function(field) {
    return Session.get('settingsErrors')[field];
  },
  errorClass: function(field) {
    return !!Session.get('settingsErrors')[field] ? 'has-error' : '';
  },
  years: function() {
    var a = [], curYear = new Date().getFullYear();
    for (var i = curYear; i >= 1950; i--) {
      a.push({y: i + "年"});
    }
    return a;
  },
  months: function() {
    var a = [];
    for (var i = 1; i <= 12; i++) {
      a.push({m: i + "月"});
    }
    return a;
  },
  days: function() {
    return getDaysArray();
  },
  teacherStateList: function(val) {
    var arr = getTeacherStateDict();
    var a = [];
    _.each(arr, function(obj) {
      var newObj = {key: obj.key};
      var text = obj.name;
      if (obj.hint) {
        text += "(" + obj.hint + ")"
      }
      newObj.text = text;
      if (obj.key == val) {
        newObj.selected = true;
      }
      a.push(newObj);
    });
    return a;
  },
  eduStageList: function(val) {
    var a = getEduStageDict(), optionList = [];
    optionList.push({key: "", text: " - 阶段 - "});
    _.each(a, function(obj) {
      var newObj = {key: obj.key, text: obj.text};
      if (obj.key == val) {
        newObj.selected = true;
      }
      optionList.push(newObj);
    });
    return optionList;
  },
  eduSubjectList: function(stage, val) {
    return getEduSubjectOptionList(stage, val);
  },
  eduGradeList: function(stage, val) {
    return getEduGradeOptionList(stage, val);
  }
});

Template.profileEditBasicForm.events({
  //add your events here
  'submit form': function(e) {
    e.preventDefault();
    var userId = this.user._id;
    var curForm = e.target, $curForm = $(curForm);
    var gender = $(curForm).find('[name="gender"]').val();
    var birthday = parseInt($('.birthdayYear').val()) + '-' + parseInt($('.birthdayMonth').val()) + '-' + parseInt($('.birthdayDay').val());
    var state = $(curForm).find('[name="state"]').val();
    var subjects = getSubjectsInput($curForm);
    var address = {
      province: {
        "code": $(".addressProvince").val(),
        "name": $(".addressProvince").find("option:selected").text(),
        "type": $(".addressProvince").find("option:selected").attr('type')
      },
      city: {"code": $(".addressCity").val(), "name": $(".addressCity").find("option:selected").text()},
      district: {"code": $(".addressDistrict").val(), "name": $(".addressDistrict").find("option:selected").text()},
      road: $(".addressRoad").val()
    };
    // console.log(address);
    var profile = {
      name: $(curForm).find('[name=name]').val(),
      gender: gender,
      birthday: birthday,
      state: state,
      subjects: subjects,
      address: address,
      selfIntro: $(curForm).find('[name=selfIntro]').val()
    }
    // console.log(profile);

    $('.subject-item').removeClass('has-error');
    var errors = validateProfile(profile);
    if (errors.hasError) {
      if (errors.subjects) {
        var i = errors.subjects_seq;
        $('.subject-item:visible' + (i ? ':eq(' + (i - 1) + ')' : '')).addClass('has-error');
      }
      return Session.set('settingsErrors', errors);
    }

    Meteor.call('updateProfile', userId, profile, function(error, result) {
      if (error)
        return throwError(error.reason);

      Router.go(result.goPage);
    });
  },
  'change select.birthday': function(e) {
    var t = e.target;
    if (!t.classList.contains('birthdayYear') && !t.classList.contains('birthdayMonth')) {
      return;
    }
    var m = parseInt($('.birthdayMonth').val());
    if (t.classList.contains('birthdayYear') && m != 2) {
      return;
    }
    var $daySelect = $(".birthdayDay");
    $daySelect.children().remove();
    var days = getDaysArray();
    $.each(days, function(i, day) {
      $daySelect.append('<option>' + day.d + '</option>');
    });
  },
  'change select.address': function(e) {// 地区select组件事件
    var t = e.target;
    if (!t.classList.contains('addressProvince') && !t.classList.contains('addressCity')) {
      return;
    }
    var code = t.value;
    if (t.classList.contains('addressProvince')) {
      var $citySelect = $(".addressCity");
      $citySelect.children(":gt(0)").remove();
      var $distSelect = $(".addressDistrict");
      $distSelect.children(":gt(0)").remove();
      var cur = areaOfChina.getSubAreas(code, function(error, arrCity) {
        $.each(arrCity, function(i, obj) {
          $citySelect.append('<option value="' + obj.code + '">' + obj.name + '</option>');
        });
      });
    } else if (t.classList.contains('addressCity')) {
      var $distSelect = $(".addressDistrict");
      $distSelect.children(":gt(0)").remove();
      var cur = areaOfChina.getSubAreas(code, function(error, arrDist) {
        $.each(arrDist, function(i, obj) {
          $distSelect.append('<option value="' + obj.code + '">' + obj.name + '</option>');
        });
      });
    }
  },
  'click .btn-add-edu-item': function(e) {
    $item = $(".subject-item").last().clone();
    $item.removeClass('has-error');
    $item.show();
    $item.find("input[type=checkbox]").removeAttr('checked');
    $item.find("select").val("");
    $item.addClass('man-insert');
    $(".subjects-list").append($item);
    if ($('.subject-item:visible').length >= maxSubjectItems) {
      $(e.target).hide();
    }
  },
  'click .btn-delete-item': function(e) {
    $item = $(e.target).closest(".subject-item");
    $item.addClass('man-delete');
    $item.hide();
    if ($('.subject-item:visible').length < maxSubjectItems) {
      $('.btn-add-edu-item').show();
    }
  },
  'change .subject-item select[name=stage]': function(e) {
    var ele = e.target, $stage = $(e.target), $item = $stage.closest(".subject-item");
    var stage = $stage.val(), $subjectSelect = $item.find('select[name=subject]'), $gradeSelect = $item.find('select[name=grade]');
    var subjectOpList = getEduSubjectOptionList(stage, $subjectSelect.val());
    $subjectSelect.children().remove();
    _.each(subjectOpList, function(obj) {
      $subjectSelect.append('<option value="' + obj.key + '" ' + (obj.selected ? 'selected="true"' : '') + '>' + obj.text + '</option>');
    });
    var gradeOpList = getEduGradeOptionList(stage, $gradeSelect.val());
    $gradeSelect.children().remove();
    _.each(gradeOpList, function(obj) {
      $gradeSelect.append('<option value="' + obj.key + '" ' + (obj.selected ? 'selected="true"' : '') + '>' + obj.text + '</option>');
    });
  }
});

Template.profileEditBasicForm.onCreated(function() {
  //add your statement here
  Session.set('settingsErrors', {});
});

Template.profileEditBasicForm.onRendered(function() {
  //add your statement here
  //var user = Meteor.user();
  var user = this.data.user;
  // init area province list
  var $proSelect = $(".addressProvince");
  var cur = areaOfChina.getProvince(function(error, arrProv) {
    $.each(arrProv, function(i, obj) {
      $proSelect.append('<option value="' + obj.code + '" type="' + (obj.type ? obj.type : 0) + '">' + obj.name + '</option>');
    });
    if (user && user.profile) {
      var userAddress = user.profile.address;
      if (userAddress && userAddress.province && userAddress.province.code) {
        $proSelect.val(userAddress.province.code);
      }
    }
  });

  if (!user || !user.profile) {
    return;
  }
  // init user's some properties
  if (user.profile.birthday) {
    var a = user.profile.birthday.split('-');
    $('.birthdayYear').val(a[0] + '年');
    $('.birthdayMonth').val(a[1] + '月');
    $('.birthdayDay').val(a[2] + '日');
  }
  $("select[name=gender]").val(user.profile.gender);

  var userAddress = user.profile.address;
  if (userAddress && userAddress.province) {
    if (userAddress.city && userAddress.city.code) {
      var cur = areaOfChina.getSubAreas(userAddress.province.code, function(error, arrCity) {
        var $citySelect = $(".addressCity");
        $.each(arrCity, function(i, obj) {
          $citySelect.append('<option value="' + obj.code + '">' + obj.name + '</option>');
        });
        $citySelect.val(userAddress.city.code);
      });
    }
    if (userAddress.district && userAddress.district.code) {
      var cur = areaOfChina.getSubAreas(userAddress.city.code, function(error, arrDist) {
        var $distSelect = $(".addressDistrict");
        $.each(arrDist, function(i, obj) {
          $distSelect.append('<option value="' + obj.code + '">' + obj.name + '</option>');
        });
        $distSelect.val(userAddress.district.code);
      });
    }
  }
});

Template.profileEditBasicForm.onDestroyed(function() {
  //add your statement here
});

var getEduSubjectOptionList = function(stage, val) {
  var a = getEduSubjectDict(), optionList = [];
  optionList.push({key: "", text: " - 科目 - "});
  _.each(a, function(obj) {
    if (stage == 'elementary' && !obj.only_elementary) {
      return false;
    }
    var newObj = {key: obj.key, text: obj.text};
    if (obj.key == val) {
      newObj.selected = true;
    }
    optionList.push(newObj);
  });
  return optionList;
}
var getEduGradeOptionList = function(stage, val) {
  var a = getEduGradeDict(), optionList = [];
  optionList.push({key: "", text: " - 年级 - "});
  if (!stage) {
    return optionList;
  }
  var newObj = {key: "all", text: "全部"};
  if (val === "all") {
    newObj.selected = true;
  }
  optionList.push(newObj);
  _.each(a, function(obj) {
    if (!stage || obj.key.indexOf(stage) < 0) {
      return false;
    }
    var newObj = {key: obj.key, text: obj.text};
    if (_.isArray(val)) {
      if (_.contains(val, obj.key)) {
        newObj.selected = true;
      }
    } else {
      if (obj.key == val) {
        newObj.selected = true;
      }
    }
    optionList.push(newObj);
  });
  return optionList;
}
getDaysArray = function() {
  var m = parseInt($('.birthdayMonth').val());
  var a = [], max = 31;
  if (!!m) {
    if (m == 4 || m == 6 || m == 9 || m == 11) {
      max = 30;
    } else if (m == 2) {
      max = 28;
      var y = parseInt($('.birthdayYear').val());
      if (y % 100 == 0) {
        if (y % 400 == 0) {
          max = 29;
        }
      } else if (y % 4 == 0) {
        max = 29;
      }
    }
  }
  for (var i = 1; i <= max; i++) {
    a.push({d: i + "日"});
  }
  return a;
}
getSubjectsInput = function($form) {
  $items = $form.find(".subject-item");
  var subjects = [];
  $items.each(function(i) {
    if (!$(this).is(":visible")) {
      return;
    }
    var stage = $(this).find('[name=stage]').val();
    var subject = $(this).find('[name=subject]').val();
    var grade = $(this).find('[name=grade]').val();
    subjects.push({stage: stage, subject: subject, grade: grade});
  });
  return subjects;
}
var maxSubjectItems = 3;
