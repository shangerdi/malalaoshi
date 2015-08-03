var areaOfChina = new AreaOfChina();
Template.profileEditBasic.onCreated(function() {
  Session.set('settingsErrors', {});
});
Template.profileEditBasic.onRendered(function() {
  var curUser = Meteor.user();
  // init area province list
  var $proSelect = $("#addressProvince");
  var cur = areaOfChina.getProvince(function(error, arrProv){
    $.each(arrProv, function(i, obj) {
      $proSelect.append('<option value="'+obj.code+'" type="'+(obj.type?obj.type:0)+'">'+obj.name+'</option>');
    });
    if (curUser && curUser.profile) {
      var userAddress = curUser.profile.address;
      if (userAddress && userAddress.province && userAddress.province.code) {
        $proSelect.val(userAddress.province.code);
      }
    }
  });

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
    if (userAddress.city && userAddress.city.code) {
      var cur = areaOfChina.getSubAreas(userAddress.province.code, function(error, arrCity){
        var $citySelect = $("#addressCity");
        $.each(arrCity, function(i,obj) {
          $citySelect.append('<option value="'+obj.code+'">'+obj.name+'</option>');
        });
        $citySelect.val(userAddress.city.code);
      });
    }
    if (userAddress.district && userAddress.district.code) {
      var cur = areaOfChina.getSubAreas(userAddress.city.code, function(error, arrDist){
        var $distSelect = $("#addressDistrict");
        $.each(arrDist, function(i,obj) {
          $distSelect.append('<option value="'+obj.code+'">'+obj.name+'</option>');
        });
        $distSelect.val(userAddress.district.code);
      });
    }
  }
});
var getEduSubjectOptionList = function(school, val) {
  var a = getEduSubjectDict(), optionList=[];
  optionList.push({key:"",text:" - 科目 - "});
  _.each(a, function(obj){
    if (school=='elementary' && !obj.only_elementary) {
      return false;
    }
    var newObj = {key:obj.key, text:obj.text};
    if (obj.key==val) {
      newObj.selected=true;
    }
    optionList.push(newObj);
  });
  return optionList;
}
var getEduGradeOptionList = function(school, val) {
  var a = getEduGradeDict(), optionList=[];
  optionList.push({key:"",text:" - 年级 - "});
  if (!school) {
    return optionList;
  }
  var newObj = {key:"all", text:"全部"};
  if (val==="all") {
    newObj.selected=true;
  }
  optionList.push(newObj);
  _.each(a, function(obj){
    if (!school || obj.key.indexOf(school)<0) {
      return false;
    }
    var newObj = {key:obj.key, text:obj.text};
    if (_.isArray(val)) {
      if (_.contains(val, obj.key)){
        newObj.selected=true;
      }
    } else {
     if (obj.key==val) {
        newObj.selected=true;
      }
    }
    optionList.push(newObj);
  });
  return optionList;
}
Template.profileEditBasic.helpers({
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
  },
  teacherStateList: function(val) {
    var arr = getTeacherStateDict();
    var a = [];
    _.each(arr, function(obj){
      var newObj = {key:obj.key};
      var text = obj.name;
      if (obj.hint) {
        text+="("+obj.hint+")"
      }
      newObj.text=text;
      if (obj.key==val){
        newObj.selected=true;
      }
      a.push(newObj);
    });
    return a;
  },
  eduSchoolList: function(val) {
    var a = getEduSchoolDict(), optionList=[];
    optionList.push({key:"", text:" - 学校 - "});
    _.each(a, function(obj){
      var newObj = {key:obj.key, text:obj.text};
      if (obj.key==val) {
        newObj.selected=true;
      }
      optionList.push(newObj);
    });
    return optionList;
  },
  eduSubjectList: function(school, val) {
    return getEduSubjectOptionList(school, val);
  },
  eduGradeList: function(school, val) {
    return getEduGradeOptionList(school, val);
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
getSubjectsInput = function($form) {
  $items = $form.find(".subject-item");
  var subjects=[];
  $items.each(function(i){
    if (!$(this).is(":visible")) {
      return;
    }
    var school = $(this).find('[name=school]').val();
    var subject = $(this).find('[name=subject]').val();
    var grade = $(this).find('[name=grade]').val();
    subjects.push({school:school,subject:subject,grade:grade});
  });
  return subjects;
}
Template.profileEditBasic.events({
  'submit form': function(e) {
    e.preventDefault();
    var curForm = e.target, $curForm = $(curForm);
    var gender = $(curForm).find('input[name="gender"]:checked').val();
    var birthday = parseInt($('#birthdayYear').val())+'-'+parseInt($('#birthdayMonth').val())+'-'+parseInt($('#birthdayDay').val());
    var state = $(curForm).find('[name="state"]').val();
    var subjects = getSubjectsInput($curForm);
    var address = {
      province:{"code":$("#addressProvince").val(), "name":$("#addressProvince").find("option:selected").text(), "type":$("#addressProvince").find("option:selected").attr('type')},
      city:{"code":$("#addressCity").val(), "name":$("#addressCity").find("option:selected").text()},
      district:{"code":$("#addressDistrict").val(), "name":$("#addressDistrict").find("option:selected").text()},
      road:$("#addressRoad").val()
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
        $('.subject-item:visible'+(i?':eq('+(i-1)+')':'')).addClass('has-error');
      }
      return Session.set('settingsErrors', errors);
    }

    Meteor.call('updateProfile', profile, function(error, result) {
      if (error)
        return throwError(error.reason);

      Router.go('profileEditEdu');  
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
      var $citySelect = $("#addressCity");
      $citySelect.children(":gt(0)").remove();
      var $distSelect = $("#addressDistrict");
      $distSelect.children(":gt(0)").remove();
      var cur = areaOfChina.getSubAreas(code, function(error, arrCity){
        $.each(arrCity, function(i,obj) {
          $citySelect.append('<option value="'+obj.code+'">'+obj.name+'</option>');
        });
      });
    } else if (t.id=='addressCity') {
      var $distSelect = $("#addressDistrict");
      $distSelect.children(":gt(0)").remove();
      var cur = areaOfChina.getSubAreas(code, function(error, arrDist){
        $.each(arrDist, function(i,obj) {
          $distSelect.append('<option value="'+obj.code+'">'+obj.name+'</option>');
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
  },
  'click .btn-delete-item': function(e){
    $item = $(e.target).closest(".subject-item");
    $item.addClass('man-delete');
    $item.hide();
  },
  'change .subject-item select[name=school]': function(e) {
    var ele = e.target, $school = $(e.target), $item = $school.closest(".subject-item");
    var school = $school.val(), $subjectSelect = $item.find('select[name=subject]'), $gradeSelect = $item.find('select[name=grade]');
    var subjectOpList = getEduSubjectOptionList(school, $subjectSelect.val());
    $subjectSelect.children().remove();
    _.each(subjectOpList, function(obj) {
      $subjectSelect.append('<option value="'+obj.key+'" '+(obj.selected?'selected="true"':'')+'>'+obj.text+'</option>');
    });
    var gradeOpList = getEduGradeOptionList(school, $gradeSelect.val());
    $gradeSelect.children().remove();
    _.each(gradeOpList, function(obj) {
      $gradeSelect.append('<option value="'+obj.key+'" '+(obj.selected?'selected="true"':'')+'>'+obj.text+'</option>');
    });
  }
});
