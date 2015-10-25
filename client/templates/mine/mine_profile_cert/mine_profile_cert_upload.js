var clearUploadErr = function($uploadBox) {
  $uploadBox.removeClass('has-error');
  $uploadBox.find('.help-block').text('');
}
var getCertType = function() {
  return Router.current().params.certType;
}
var STATUS_TODO = 1, STATUS_SELECTED = 2, STATUS_UPLOADING = 3, STATUS_DONE = 4, STATUS_FAILURE = 5;
var uploadStatus = new ReactiveVar(STATUS_TODO);
var getCertInfo = function() {
  return UserCertification.findOne({'userId': Meteor.userId()});
}
var hasUploadedImg = function() {
  var certType = getCertType(), certInfo = getCertInfo();
  if (!certInfo) return '';
  if(certType=="id" && certInfo.idCardImgUrl || certType=="edu" && certInfo.eduCertImgUrl
    || certType=="teacher" && certInfo.teacherCertImgUrl) {
    return true;
  }
  if(certType=="profession") {
    if (certInfo.professionItems && certInfo.professionItems.length>0) {
      return true;
    }
  }
  return false;
}
var getCertAuditInfo = function() {
  if (!Meteor.userId()) return null;
  var auditObj = TeacherAudit.findOne({'userId': Meteor.userId()});
  if (auditObj) {
    return auditObj.certInfo;
  }
  return null;
}
var getAuditStatus = function() {
  var certAuditInfo = getCertAuditInfo();
  if (certAuditInfo && certAuditInfo.status) {
    if ('approved'===certAuditInfo.status) {
      return STATUS_DONE;
    }
    if ('rejected'===certAuditInfo.status) {
      return STATUS_FAILURE;
    }
  }
  return STATUS_TODO;
}
var fileToUpload = null;
Template.mineProfileCertUpload.onCreated(function(){
  fileToUpload = null;
  uploadStatus.set(STATUS_TODO);
  Meteor.subscribe('curUserCertification', function(){
    if (hasUploadedImg()) {
      uploadStatus.set(STATUS_DONE);
    }
  });
});
Template.mineProfileCertUpload.helpers({
  getTitle: function() {
    var certType = getCertType();
    if(certType=="id") {
      return "身份认证";
    }
    if(certType=="edu") {
      return "学历认证";
    }
    if(certType=="teacher") {
      return "教师证认证";
    }
    if(certType=="profession") {
      return "专业资质认证";
    }
  },
  getHintText: function() {
    var certType = getCertType();
    if(certType=="id") {
      return "请上传您的身份证照片";
    }
    if(certType=="edu") {
      return "请上传毕业证书或学位证书照片";
    }
    if(certType=="teacher") {
      return "请上传教师资格证照片";
    }
    if(certType=="profession") {
      return "请上传已专业资质证书照片";
    }
  },
  getCertImgUrl: function() {
    var certType = getCertType(), certInfo = getCertInfo();
    var url = '', cameraImg = '/images/camera.png';
    if (!certInfo) return cameraImg;
    if(certType=="id") {
      url = certInfo.idCardImgUrl;
    }
    if(certType=="edu") {
      url = certInfo.eduCertImgUrl;
    }
    if(certType=="teacher") {
      url = certInfo.teacherCertImgUrl;
    }
    if(certType=="profession") {
      if (certInfo.professionItems && certInfo.professionItems.length>0) {
        url = certInfo.professionItems[0].certImgUrl;
      }
    }
    if (url) return url;
    return cameraImg;
  },
  getStatusStr: function(step) {
    var status = STATUS_TODO;
    if (step==='submit') {
      status = uploadStatus.get();
    }
    if (step==='audit') {
      status = getAuditStatus();
    }
    if (status==STATUS_FAILURE) {
      return '失败';
    }
    return '成功';
  },
  getStatusImg: function(step) {
    var status = STATUS_TODO;
    if (step==='submit') {
      status = uploadStatus.get();
    }
    if (step==='audit') {
      status = getAuditStatus();
    }
    if (status==STATUS_FAILURE) {
      return '/images/apply/fail.png';
    }
    if (status==STATUS_DONE) {
      return '/images/apply/audit-ok.png';
    }
    return '/images/apply/audit-todo.png';
  },
  submitButtonText: function() {
    if (hasUploadedImg()) {
      return "重新申请";
    }
    return "提交申请";
  },
  uploadButtonText: function() {
    var status = uploadStatus.get();
    if (status==STATUS_FAILURE) {
      return "上传失败";
    }
    if (status==STATUS_UPLOADING) {
      return "正在上传中 ...";
    }
    return "请点击上传图片";
  }
});
var submitProcess = function(e) {
  var ele = e.target, $ele = $(ele);
  var $uploadBox = $(".cert-upload-box");
  clearUploadErr($uploadBox);
  var inputEle = $uploadBox.find("input[type=file]")[0];
  var file = fileToUpload ? fileToUpload : (inputEle ? inputEle.files[0] : null);
  if (!file) {
    $uploadBox.addClass('has-error');
    $uploadBox.find('.help-block').text('请先选择图片');
    return false;
  }

  // upload the picture to server
  var uploader = new Slingshot.Upload("imgUploads");
  var error = uploader.validate(file);
  if (error) {
    console.error(error);
    $uploadBox.addClass('has-error');
    $uploadBox.find('.help-block').text(error.reason);
    return false;
  }
  // ready to upload
  uploadStatus.set(STATUS_UPLOADING);
  $uploadBox.find(".uploading-hint-box").show();
  $ele.attr("disabled", true);
  $ele.css("cursor", "wait");
  uploader.send(file, function(error, downloadUrl) {
    if (error) {
      console.error(error);
      $uploadBox.addClass('has-error');
      $uploadBox.find('.help-block').text(error.reason);
      $uploadBox.find(".uploading-hint-box").hide();
      $ele.removeAttr("disabled");
      $ele.css("cursor", "pointer");
      uploadStatus.set(STATUS_FAILURE);
      return;
    }
    // console.log(downloadUrl);
    $uploadBox.data("changed", false);
    $uploadBox.find(".cert-img-box img").attr("src", downloadUrl);

    // do save downloadUrl to db
    var params = {}, certType = getCertType();
    params[certType] = {'url': downloadUrl};
    Meteor.call('uploadCertificationForApp', params, function(error, result) {
      $uploadBox.find(".uploading-hint-box").hide();
      $ele.removeAttr("disabled");
      $ele.css("cursor", "pointer");
      if (error) {
        $uploadBox.addClass('has-error');
        $uploadBox.find('.help-block').text(error.reason);
        uploadStatus.set(STATUS_FAILURE);
        return throwError(error.reason);
      }
      uploadStatus.set(STATUS_DONE);
      $uploadBox.find('.help-block').text("保存成功");
      fileToUpload = null;
      if (inputEle) {
        inputEle.value=null;
      }
    });
  });
}
var toSelectFile = function(e) {
  var $uploadBox = $(".cert-upload-box");
  clearUploadErr($uploadBox);
  if (Meteor.isCordova) {
    CameraAlbumActionSheet.showCameraAlbum_one(function(one_image_base64){
      console.log(one_image_base64);
      fileToUpload = CameraAlbumActionSheet.convertBase64UrlToBlob(one_image_base64);
      $uploadBox.find(".cert-img-box img").attr("src", one_image_base64);
      uploadStatus.set(STATUS_SELECTED);
    }, function(err){
      console.log(err);
    });
  } else {
    $uploadBox.find("input[type=file]")[0].click();
  }
}
Template.mineProfileCertUpload.events({
  'change input[type=file]': function(e) {
    var ele = e.target, $ele = $(ele);
    var $uploadBox = $(".cert-upload-box");
    clearUploadErr($uploadBox);
    var imgType = ["gif", "jpeg", "jpg", "bmp", "png"];
    var flag = validImgFile();
    if (!flag) {
      return false;
    }
    var reader=new FileReader();
    reader.onload=function(){
      $uploadBox.find(".cert-img-box img").attr("src", reader.result);
      uploadStatus.set(STATUS_SELECTED);
      reader=null;
    };
    reader.readAsDataURL(ele.files[0]);
    return;

    // valid image properties
    function validImgFile() {
      if (!ele.value || !ele.files) {
        return false;
      }
      //验证上传文件格式是否正确
      if (!RegExp("\.(" + imgType.join("|") + ")$", "i").test(ele.value.toLowerCase())) {
        $uploadBox.addClass('has-error');
        $uploadBox.find('.help-block').text('选择图片类型错误');
        this.value = "";
        return false;
      }
      return true;
    }
  },
  'click .file-input-mask, click .img-box': function(e) {
    if (uploadStatus.get()==STATUS_UPLOADING) return;
    var ele = e.target, $ele = $(ele);
    if (ele.tagName==='input' || ele.tagName==='INPUT' || ele.tagName==='Input') return;
    if (hasUploadedImg()) {
      IonPopup.confirm({
        template: '是否确认重新申请？',
        cancelText: '否',
        okText: '是',
        onOk: function() {
          toSelectFile(e);
        }
      });
      return;
    }
    toSelectFile(e);
  },
  'click #submit': function(e) {
    if (hasUploadedImg()) {
      IonPopup.confirm({
        template: '是否确认重新申请？',
        cancelText: '否',
        okText: '是',
        onOk: function() {
          setTimeout(function(){
            submitProcess(e);
          },0);
        }
      });
      return;
    }
    submitProcess(e);
  }
});
