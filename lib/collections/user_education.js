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
