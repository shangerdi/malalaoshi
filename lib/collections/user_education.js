UserEducation = new Mongo.Collection('userEducation');

var UserEducationItemSchema = new SimpleSchema({
  degree: {
    type: String,
    label: 'Degree'
  },
  college: {
    type: String,
    label: 'College(or University) Name',
    max: 12
  },
  major: {
    type: String,
    label: 'Major',
    max: 12
  }
});
UserEducation.attachSchema(new SimpleSchema({
  userId: {
    type: String,
    label: 'User Id',
    index: true
  },
  eduItems: {
    type: [UserEducationItemSchema]
  }
}));

getEduDegreeDict = function() {
  return {
    'postDoctor': "博士后",
    'doctor': "博士",
    'master': "硕士",
    'bachelor': "本科",
    'vocational': "专科",
    'highSchool': "高中"
    // 'midSchool': "初中",
    // 'eleSchool': "小学"
  };
}
getEduDegreeText = function(degree) {
  var dict = getEduDegreeDict();
  return dict[degree];
}
getEduDegreeList = function(flag) {
  var dict = getEduDegreeDict();
  var a = [];
  if (flag) {
    a.push({key:"", text: " - 请选择 - "});
  }
  _.each(dict, function(v,k){
    a.push({key:k, text:v});
  });
  return a;
}

/*
 * 年级 数据定义
 */
getEduSchoolDict = function() {
  return {
    "elementary":{key:"elementary", text: "小学"},
    "middle":{key:"middle", text: "初中"},
    "high":{key:"high", text: "高中"}
  };
}
getEduSchoolText = function(v) {
  var e = getEduSchoolDict()[v];
  if (e) {
    return e.text;
  }
}
getEduGradeDict = function() {
  return {
    "elementary_1": {key:"elementary_1", text:"一年级"},
    "elementary_2": {key:"elementary_2", text:"二年级"},
    "elementary_3": {key:"elementary_3", text:"三年级"},
    "elementary_4": {key:"elementary_4", text:"四年级"},
    "elementary_5": {key:"elementary_5", text:"五年级"},
    "elementary_6": {key:"elementary_6", text:"六年级"},
    "middle_1": {key:"middle_1", text:"初一"},
    "middle_2": {key:"middle_2", text:"初二"},
    "middle_3": {key:"middle_3", text:"初三"},
    "high_1": {key:"high_1", text:"高一"},
    "high_2": {key:"high_2", text:"高二"},
    "high_3": {key:"high_3", text:"高三"}
  };
}
getEduGradeText = function(v) {
  var e = getEduGradeDict()[v];
  if (e) {
    return e.text;
  }
}

/*
 * 学科（课程科目）数据定义
 */
getEduSubjectDict = function() {
  return {
    "chinese": {key:"chinese", text:"语文", only_elementary:true},
    "mathematics": {key:"mathematics", text:"数学", only_elementary:true},
    "english": {key:"english", text:"英语", only_elementary:true},
    "physics": {key:"physics", text:"物理"},
    "chemistry": {key:"chemistry", text:"化学"},
    "geography": {key:"geography", text:"地理"},
    "politics": {key:"politics", text:"政治"},
    "biology": {key:"biology", text:"生物"},
    "history": {key:"history", text:"历史"}
  };
}
getEduSubjectText = function(v) {
  var e = getEduSubjectDict()[v];
  if (e) {
    return e.text;
  }
}
