/**
 * 超级管理员用户{role: admin}   可以创建删除用户
 * 普通管理员用户{role: manager} 审查数据
 * 老师用户{role: teacher}       教师，审核认证后才可以被学生或家长看到
 * 学生{role: student}
 * 家长{role: parent}
 * ...
 */
UI.registerHelper('getUserRoleList', function(){
  return [{
      key: 'admin',
      name: '超级管理员'
    },{
      key: 'manager',
      name: '普通管理员'
    },{
      key: 'teacher',
      name: '老师'
    },{
      key: 'student',
      name: '学生'
    },{
      key: 'parent',
      name: '家长'
    }
  ];
});

validateProfile = function (profile) {
  var errors = {}, hasError = false;
  if (!profile.name) {
    errors.name = '请输入名字';
    hasError = true;
  } else {
    profile.name = profile.name.trim();
    if (profile.name.length>4) {
      errors.name = '姓名不能超过4个字';
      hasError = true;
    }
  }
  if (!profile.gender) {
    errors.gender = '请选择性别';
    hasError = true;
  }
  if (!profile.birthday) {
    errors.birthday = '请选择正确的出生日期';
    hasError = true;
  }
  if (!profile.state) {
    errors.state = '请选择目前身份';
    hasError = true;
  }
  if (!profile.subjects || !profile.subjects.length) {
    errors.subjects = '请填写您擅长的教学科目';
    hasError = true;
  } else {
    var a = profile.subjects, a2 = [], hasError = false;
    _.each(a, function(obj, i) {
      if (hasError) {
        return false;
      }
      if (!obj.subject || !obj.stage || !obj.grade) {
        errors.subjects = "请确保第"+(i+1)+"项填写完整";
        errors.subjects_seq=i+1;
        hasError = true;
        return false;
      }
      var exists = _.find(a2, function(obj2, j) {
        if (hasError) {
          return true;// end the loop
        }
        if (obj.subject==obj2.subject && obj.stage==obj2.stage && obj.grade==obj2.grade) {
          errors.subjects = "第"+(i+1)+"项与第"+(j+1)+"项重复了";
          errors.subjects_seq=i+1;
          hasError = true;
          return true;
        }
      });
      if (!exists) {
        a2.push(obj);
      }
    });
  }
  if (!profile.address || !profile.address.district.code) {// || !profile.address.city || !profile.address.district
    errors.address = '请确认所在区域';
    hasError = true;
  }
  if (!profile.selfIntro) {
    errors.selfIntro = '请输入个人简介';
    hasError = true;
  } else {
    if (profile.selfIntro.length>500) {
      errors.selfIntro = '个人简介不能超过500个字';
      hasError = true;
    }
  }
  errors.hasError = hasError;
  return errors;
}
getTeacherStateDict = function() {
  return {
    "1":{
    key:1,
    name: "在职教师",
    hint: "含公立学校和培训机构"
    },
    "2":{
      key: 2,
      name: "准教师"
    }
  };
}
getTeacherStateText = function(v) {
  var e = getTeacherStateDict()[v];
  if (e) {
    return e.name;
  }
}
