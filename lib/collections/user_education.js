UserEducation = new Mongo.Collection('userEducation');

UserEducation.allow({
  update: function(userId, doc) {
    return ownsDocument(userId, doc);
  }
});

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
getEduSchoolList = function() {
  return [
    {key:"elementary", text: "小学"},
    {key:"middle", text: "初中"},
    {key:"high", text: "高中"}
  ];
}
getEduGradeList = function() {
  return [
    {key:"elementary_1", text:"一年级"},
    {key:"elementary_2", text:"二年级"},
    {key:"elementary_3", text:"三年级"},
    {key:"elementary_4", text:"四年级"},
    {key:"elementary_5", text:"五年级"},
    {key:"elementary_6", text:"六年级"},
    // {key:"elementary_99", text:"小升初"},
    {key:"middle_1", text:"初一"},
    {key:"middle_2", text:"初二"},
    {key:"middle_3", text:"初三"},
    // {key:"middle_99", text:"中考"},
    {key:"high_1", text:"高一"},
    {key:"high_2", text:"高二"},
    {key:"high_3", text:"高三"}//,
    // {key:"high_99", text:"高考"}
  ];
}
getEduGradeText = function(v) {
  var a = getEduGradeList();
  var e = _.find(a, function(obj){
    return obj.key==v;
  });
  if (e) {
    return e.name;
  }
  return null;
}

/*
 * 学科（课程科目）数据定义
 */
getEduSubjectList = function() {
  return [
    {key:"chinese", text:"语文"},
    {key:"mathematics", text:"数学"},
    {key:"english", text:"英语"},
    {key:"physics", text:"物理"},
    {key:"chemistry", text:"化学"},
    {key:"geography", text:"地理"},
    {key:"politics", text:"政治"},
    {key:"biology", text:"生物"},
    {key:"history", text:"历史"}
  ];
}
getEduSubjectText = function(v) {
  var a = getEduSubjectList();
  var e = _.find(a, function(obj){
    return obj.key==v;
  });
  if (e) {
    return e.name;
  }
  return null;
}
