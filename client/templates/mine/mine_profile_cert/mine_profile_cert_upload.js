var clearUploadErr = function($uploadBox) {
  $uploadBox.removeClass('has-error');
  $uploadBox.find('.help-block').text('');
}
var getCertType = function() {
  return Router.current().params.certType;
}
var fileToUpload = null;
Template.mineProfileCertUpload.onCreated(function(){
  fileToUpload = null;
  Meteor.subscribe('curUserCertification');
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
    var certType = getCertType(), certInfo = UserCertification.findOne({'userId': Meteor.userId()});
    if (!certInfo) return '';
    if(certType=="id") {
      return certInfo.idCardImgUrl;
    }
    if(certType=="edu") {
      return certInfo.eduCertImgUrl;
    }
    if(certType=="teacher") {
      return certInfo.teacherCertImgUrl;
    }
    if(certType=="profession") {
      if (certInfo.professionItems && certInfo.professionItems.length>0) {
        return certInfo.professionItems[0].certImgUrl;
      }
    }
  }
});
Template.mineProfileCertUpload.events({
  'change input[type=file]': function(e) {
    var ele = e.target, $ele = $(ele);
    var $uploadBox = $ele.closest(".cert-upload-box");
    clearUploadErr($uploadBox);
    var imgType = ["gif", "jpeg", "jpg", "bmp", "png"];
    var flag = validImgFile();
    if (!flag) {
      return false;
    }
    var reader=new FileReader();
    reader.onload=function(){
      $uploadBox.find(".cert-img-box img").attr("src", reader.result);
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
  'click .file-input-mask': function(e) {
    var ele = e.target, $ele = $(ele);
    var $uploadBox = $ele.closest(".cert-upload-box");
    clearUploadErr($uploadBox);
    if (Meteor.isCordova) {
      CameraAlbumActionSheet.showCameraAlbum_one(function(one_image_base64){
        console.log(one_image_base64);
        fileToUpload = CameraAlbumActionSheet.convertBase64UrlToBlob(one_image_base64);
        $uploadBox.find(".cert-img-box img").attr("src", one_image_base64);
      }, function(err){
        console.log(err);
      });
    }
  },
  'click #submit': function(e) {
    var ele = e.target, $ele = $(ele);
    var $uploadBox = $ele.closest(".cert-upload-box");
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
          return throwError(error.reason);
        }
        $uploadBox.find('.help-block').text("保存成功");
        fileToUpload = null;
        if (inputEle) {
          inputEle.value=null;
        }
      });
    });
  }
});
