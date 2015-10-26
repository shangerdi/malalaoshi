var maxPhotosCount = 20;
var toDeleteCount = new ReactiveVar(0);
var isManaging = new ReactiveVar(false);
var uploader = new Slingshot.Upload("imgUploads");
var uploadingList = new ReactiveVar([]);
var uploadingCheck;
// upload methods, 现在只支持同时单个文件上传
var getCurUploadProgress = function() {
  var p = uploader.progress();
  if (isNaN(p)) return 0;
  return Math.floor(p * 100);
}
var startOneUpload = function(src) {
  var a = uploadingList.get();
  a.push({'src':src, 'progress':0});
  uploadingList.set(a);
  if (!uploadingCheck) {
    uploadingCheck = setInterval(function(){
      var l = uploadingList.get();
      if (l.length) {
        var p = getCurUploadProgress();
        l[0].progress = p;
        uploadingList.set(a);
      }
    }, 200);
  }
}
var stopOneUpload = function() {
  var a = uploadingList.get();
  a.shift();
  uploadingList.set(a);
  if (!uploadingCheck && a.length==0) {
    clearInterval(uploadingCheck);
    uploadingCheck = 0;
  }
}
var stopAllUpload = function() {
  uploadingList.set([]);
  clearInterval(uploadingCheck);
  uploadingCheck = 0;
}
// management methods
var init = function() {
  toDeleteCount.set(0);
  isManaging.set(false);
  $(".manage-box").removeClass('checked');
}
var doManage = function(e) {
  isManaging.set(true);
  toDeleteCount.set($(".manage-box.checked").length);
}
var doDelete = function(e) {
  if (toDeleteCount.get()===0) {
    alert("请选择照片");
    return;
  }
  IonPopup.confirm({
    title: '操作提示',
    template: '你确定要删除所选择的照片吗？',
    cancelText: '取消',
    okText: '确定',
    onOk: function() {
      IonLoading.show({backdrop: true, customTemplate: "正在删除..."});
      var photoUrls = [];
      $(".manage-box.checked").each(function(){
        $photoItem = $(this).closest(".photo");
        var img = $photoItem.find("img")[0];
        photoUrls.push(img.src);
      });
      Meteor.call('deletePersonalPhoto', photoUrls, function(error, result) {
        IonLoading.hide();
        if (error) {
          console.log(error);
          alert(error.reason);
          return throwError(error.reason);
        }
        init();
      });
    }
  });
}
var manageButtonHandler = function(e) {
  if (!isManaging.get()) {
    doManage(e);
  } else {
    cancleManageHandler(e);
  }
}
var cancleManageHandler = function(e){
  isManaging.set(false);
  $(".manage-box").removeClass('checked');
}
Template.mineProfilePhotos.onRendered(function(){
  init();
  $("[data-action=manage-profile-photos]").click(manageButtonHandler);
});
Template.mineProfilePhotos.helpers({
  photoList: function() {
    var teacherAudit = TeacherAudit.findOne({'userId': Meteor.userId()});
    if (teacherAudit) {
      return teacherAudit.personalPhoto;
    }
  },
  curCount: function() {
    var teacherAudit = TeacherAudit.findOne({'userId': Meteor.userId()});
    if (!teacherAudit || !teacherAudit.personalPhoto || !teacherAudit.personalPhoto.length) {
      return 0;
    }
    return teacherAudit.personalPhoto.length;
  },
  maxCount: function() {
    return maxPhotosCount;
  },
  isHideAddButton: function() {
    if (isManaging.get()) {
      return true;
    }
    var teacherAudit = TeacherAudit.findOne({'userId': Meteor.userId()});
    if (teacherAudit && teacherAudit.personalPhoto && teacherAudit.personalPhoto.length) {
      return teacherAudit.personalPhoto.length >= maxPhotosCount;
    }
    return false;
  },
  toDeleteCount: function() {
    return toDeleteCount.get();
  },
  isManaging: function() {
    return isManaging.get();
  },
  uploadingList: function() {
    return uploadingList.get();
  },
  leftProgress: function(a) {
    if (!a) return 100;
    return 100 - a;
  }
});
var uploadFile = function(src, file, $ele, callback) {
  var error = uploader.validate(file);
  if (error) {
    console.log(error);
    alert(error.reason);
    $ele.removeAttr("disabled");
    $ele.css("cursor", "pointer");
    callback();
    return false;
  }
  // ready to upload
  startOneUpload(src);
  uploader.send(file, function(error, downloadUrl) {
    if (error) {
      console.log(error);
      alert(error.reason);
      $ele.removeAttr("disabled");
      $ele.css("cursor", "pointer");
      stopOneUpload();
      callback();
      return;
    }
    // console.log(downloadUrl);
    // do save downloadUrl to db
    Meteor.call('addPersonalPhoto', downloadUrl, function(error, result) {
      $ele.removeAttr("disabled");
      $ele.css("cursor", "pointer");
      stopOneUpload();
      callback();
      if (error) {
        console.log(error);
        alert(error.reason);
        return throwError(error.reason);
      }
      alert("添加成功");
    });
  });
}
Template.mineProfilePhotos.events({
  'click .add-photo': function(e) {
    if (Meteor.isCordova) {
      var ele = e.target, $ele = $(ele);
      if ($ele.attr('disabled')) {
        alert("Please wait!");
        return;
      }
      CameraAlbumActionSheet.showCameraAlbum_one(function(one_image_base64){
        console.log(one_image_base64);
        $ele.attr("disabled", true);
        $ele.css("cursor", "wait");
        IonLoading.show({backdrop: true});
        var file = CameraAlbumActionSheet.convertBase64UrlToBlob(one_image_base64);
        uploadFile(one_image_base64, file, $ele, function(){
          IonLoading.hide();
        });
      }, function(err){
        console.log(err);
      });
    }
  },
  'change input[type=file]': function(e) {
    var ele = e.target, $ele = $(ele);
    var imgType = ["gif", "jpeg", "jpg", "bmp", "png"];
    var flag = validImgFile();
    if (!flag) {
      return false;
    }
    
    $ele.attr("disabled", true);
    $ele.css("cursor", "wait");
    var file = ele.files[0];
    var reader=new FileReader();
    reader.onload=function(){
      uploadFile(reader.result, file, $ele, function(){
        ele.value=null;
      });
      reader=null;
    };
    reader.readAsDataURL(file);
    return;

    // valid image properties
    function validImgFile() {
      if (!ele.value || !ele.files) {
        return false;
      }
      //验证上传文件格式是否正确
      if (!RegExp("\.(" + imgType.join("|") + ")$", "i").test(ele.value.toLowerCase())) {
        alert('选择图片类型错误');
        this.value = "";
        return false;
      }
      return true;
    }
  },
  'click .manage-box': function(e) {
    var ele = e.target, $ele = $(ele);
    $ele.toggleClass('checked');
    toDeleteCount.set($(".manage-box.checked").length);
  },
  'click .delete-photos': function(e) {
    if (toDeleteCount.get()==0) {
      return;
    }
    doDelete(e);
  }
});
