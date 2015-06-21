Template.profileEditCert.helpers({
  certInfo: function () {
    return UserCertification.findOne({userId: Meteor.userId()});
  },
  professionItems: function () {
    var certInfo = UserCertification.findOne({userId: Meteor.userId()});
    if (!certInfo || !certInfo.professionItems) {
      return [];
    }
    return certInfo.professionItems;
  }
});
var clearUploadBoxErr = function($uploadBox) {
  $uploadBox.removeClass('has-error');
  $uploadBox.find('.help-block').text('');
}
var clearUploadBox = function($uploadBox) {
  $uploadBox.find('.cert-img-box img').removeAttr('src');
  clearUploadBoxErr($uploadBox);
}
Template.profileEditCert.events({
  'change .cert-img-box input[type=file]': function(e) {
    var ele = e.target, $ele = $(ele);
    var $uploadBox = $ele.closest(".cert-upload-box");
    clearUploadBoxErr($uploadBox);
    var imgType = ["gif", "jpeg", "jpg", "bmp", "png"];
    var flag = validImgFile();
    if (!flag) {
      return false;
    }
    // var imtUrl = getObjectURL(ele.files[0]);
    // $ele.closest(".cert-img-box").find('img').attr("src", imtUrl);
    // return;

    // upload the picture to server
    var uploader = new Slingshot.Upload("myHeadImgUploads");
    var error = uploader.validate(ele.files[0]);
    if (error) {
      console.error(error);
      $uploadBox.addClass('has-error');
      $uploadBox.find('.help-block').text(error.reason);
      return false;
    }
    uploader.send(ele.files[0], function(error, downloadUrl) {
      if (error) {
        console.error(error);
        $uploadBox.addClass('has-error');
        $uploadBox.find('.help-block').text(error.reason);
      } else {
        console.log(downloadUrl);
        $ele.closest(".cert-img-box").find('img').attr("src", downloadUrl);
      }
    });

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

    function getObjectURL(file) {
      var url = null;
      if (window.createObjectURL != undefined) {
        url = window.createObjectURL(file);
      } else if (window.URL != undefined) {
        url = window.URL.createObjectURL(file);
      } else if (window.webkitURL != undefined) {
        url = window.webkitURL.createObjectURL(file);
      }
      return url;
    }
  },
  'click .btn-add-edu-item': function(e) {
    $proItem = $(".cert-profession-items .cert-upload-box").last().clone();
    clearUploadBox($proItem);
    $proItem.addClass('man-insert');
    $proItem.show();
    $(".cert-profession-items").append($proItem);
  },
  'click .btn-delete-item': function(e) {
    $uploadBox = $(e.target).closest(".cert-upload-box");
    if ($(".cert-profession-items").children().length==1) {
      clearUploadBox($uploadBox);
      return;
    }
    $uploadBox.remove();
  },
  'click .btn-save': function(e) {
    var teacherCertImgUrl = $('.cert-upload-box').first().find('.cert-img-box img')[0].src;
    console.log(teacherCertImgUrl);
    var professionItems = [];
    $('.cert-profession-items .cert-upload-box').each(function(){
      $proItem = $(this);
      var certImgUrl = $proItem.find('.cert-img-box img')[0].src;
      if (certImgUrl) {
        professionItems.push({'certImgUrl': certImgUrl});
      }
    });
    console.log(professionItems);
    // do save
    Meteor.call('updateCertification', teacherCertImgUrl, professionItems, function(error, result) {
      if (error)
        return throwError(error.reason);
      alert("保存成功");
      $(".cert-upload-box.man-insert").remove();
      $(".cert-profession-items .cert-upload-box:gt("+professionItems.length+")").remove();
      if ($(".cert-profession-items").children().length>professionItems.length) {
        $lastBox = $(".cert-profession-items .cert-upload-box").last();
        clearUploadBox($lastBox);
      }
    });
  }
});
