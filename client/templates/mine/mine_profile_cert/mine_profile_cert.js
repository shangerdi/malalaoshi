var certUploadRoute = 'mineProfileCertUpload';
Template.mineProfileCert.helpers({
  getAuditStatusStr: function(field) {
    return '未设置';
  },
  pathForId: function() {
    return Router.routes[certUploadRoute].path({'certType': "id"});
  },
  pathForEdu: function() {
    return Router.routes[certUploadRoute].path({'certType': "edu"});
  },
  pathForTeacher: function() {
    return Router.routes[certUploadRoute].path({'certType': "teacher"});
  },
  pathForProfession: function() {
    return Router.routes[certUploadRoute].path({'certType': "profession"});
  }
});
