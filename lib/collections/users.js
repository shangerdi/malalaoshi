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
      if (!obj.subject || !obj.school || !obj.grade) {
        errors.subjects = "请确保第"+(i+1)+"项填写完整";
        errors.subjects_seq=i+1;
        hasError = true;
        return false;
      }
      var exists = _.find(a2, function(obj2, j) {
        if (hasError) {
          return true;// end the loop
        }
        if (obj.subject==obj2.subject && obj.school==obj2.school && obj.grade==obj2.grade) {
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
  if (!profile.address || !profile.address.province) {// || !profile.address.city || !profile.address.district
    errors.address = '请确认所在区域';
    hasError = true;
  }
  if (!profile.selfIntro) {
    errors.selfIntro = '请输入个人简介';
    hasError = true;
  }
  errors.hasError = hasError;
  return errors;
}
getTeacherStateDict = function() {
  return {
    "1":{
    key:1,
    name: "在职教师",
    hint: "含公立学校和培训结构"
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
Meteor.methods({
  updateProfile: function(profile) {
    check(profile, {
      name: String,
      // nickname: String,
      gender: String,
      birthday: String,
      state: String,
      subjects: Array,
      // college: String,
      // degree: String,
      // major: String,
      address: Object,
      selfIntro: String//,
      // motto: String
    });

    var errors = validateProfile(profile);
    if (!!errors.hasError) {
      throw new Meteor.Error('无效设置', "参数设置错误");
    }

    var oldProfile = Meteor.user().profile;
    if (oldProfile) {
      profile = _.extend(Meteor.user().profile, profile);
    }
    // console.log(profile);
    Meteor.users.update({_id: Meteor.userId()}, {$set:{profile:profile}});
    if (Meteor.user().role=='teacher') {// teachers need to audit
      var now = Date.now();
      TeacherAudit.update({userId:Meteor.userId()},{$set:{name:profile.name,submitTime:now,basicInfo:{submitTime:now, status: 'submited'}}},{upsert:true});
    }
    // TODO：用户操作日志 UserOpLogs
  }
});
