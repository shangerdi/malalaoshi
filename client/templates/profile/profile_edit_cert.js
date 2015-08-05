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
  },
  proItemsEmpty: function () {
    var certInfo = UserCertification.findOne({userId: Meteor.userId()});
    if (!certInfo || !certInfo.professionItems || certInfo.professionItems.length==0) {
      return true;
    }
    return false;
  }
});
var clearUploadBoxErr = function($uploadBox) {
  $uploadBox.removeClass('has-error');
  $uploadBox.find('.help-block').text('');
}
var clearUploadBox = function($uploadBox) {
  $uploadBox.find('.cert-img-box img').removeAttr('src');
  $uploadBox.find('.file-input-mask span').text('上传图片');
  clearUploadBoxErr($uploadBox);
}
var showSuccessInfo = function(msg, $context) {
  $hintBox = $(".success-hint-box");
  if ($context) {
    $hintBox = $hintBox.clone();
    $context.append($hintBox);
  }
  if (msg) {
    $hintBox.find('.text').text(msg);
  }
  $hintBox.show();
  setTimeout(function() {
    $hintBox.slideUp('normal');
    if ($context) {
      $hintBox.remove();
    }
  }, 1200);
}
var saveCertData = function(callback) {
  $teacherCertBox = $('.cert-upload-box').first();
  var teacherCertImgUrl = $teacherCertBox.find('.cert-img-box img')[0].src;
  if ($teacherCertBox.data("changed")) {
    teacherCertImgUrl = $teacherCertBox.data("oldImgSrc");
  }
  // console.log(teacherCertImgUrl);
  var professionItems = [];
  $('.cert-profession-items .cert-upload-box').each(function(){
    $proItem = $(this);
    if (!$proItem.is(":visible")) {
      return;
    }
    var certImgUrl = $proItem.find('.cert-img-box img')[0].src;
    if ($proItem.data("changed")) {
      certImgUrl = $proItem.data("oldImgSrc");
    }
    if (certImgUrl) {
      professionItems.push({'certImgUrl': certImgUrl});
    }
  });
  // console.log(professionItems);
  // do save
  Meteor.call('updateCertification', teacherCertImgUrl, professionItems, function(error, result) {
    if (error)
      return throwError(error.reason);
    if (callback) {
      callback();
    } else {
      alert("保存成功");
    }
    $(".cert-upload-box.man-insert").remove();
    $(".cert-upload-box.man-delete").show();
    $(".cert-profession-items .cert-upload-box:gt("+professionItems.length+")").remove();
    if ($(".cert-profession-items").children().length>professionItems.length) {
      $lastBox = $(".cert-profession-items .cert-upload-box").last();
      clearUploadBox($lastBox);
    }
  });
}
var maxProfessionItems = 5;
Template.profileEditCert.events({
  'change input[type=file]': function(e) {
    var ele = e.target, $ele = $(ele);
    var $uploadBox = $ele.closest(".cert-upload-box");
    var changed = $uploadBox.data("changed");
    clearUploadBoxErr($uploadBox);
    var imgType = ["gif", "jpeg", "jpg", "bmp", "png"];
    var flag = validImgFile();
    if (!flag) {
      return false;
    }
    if (!changed) {
      $uploadBox.data("changed", true);
      var oldImgSrc = $uploadBox.find(".cert-img-box img").attr("src");
      $uploadBox.data("oldImgSrc", oldImgSrc?oldImgSrc:"");
    }
    var imtUrl = getObjectURL(ele.files[0]);
    $uploadBox.find(".cert-img-box img").attr("src", imtUrl);
    $uploadBox.find('.btns-box .select-file-box').hide();
    $uploadBox.find('.btns-box .action-btn-box').show();
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
  'click .action-btn-box .btn-confirm': function(e) {
    var ele = e.target, $ele = $(ele);
    var $uploadBox = $ele.closest(".cert-upload-box");
    var file = $uploadBox.find("input[type=file]")[0].files[0];

    // upload the picture to server
    var uploader = new Slingshot.Upload("myHeadImgUploads");
    var error = uploader.validate(file);
    if (error) {
      console.error(error);
      $uploadBox.addClass('has-error');
      $uploadBox.find('.help-block').text(error.reason);
      return false;
    }
    $uploadBox.find(".uploading-hint-box").show();
    $ele.attr("disabled", true);
    $ele.css("cursor", "wait");
    uploader.send(file, function(error, downloadUrl) {
      if (error) {
        console.error(error);
        $uploadBox.addClass('has-error');
        $uploadBox.find('.help-block').text(error.reason);
      } else {
        // console.log(downloadUrl);
        $uploadBox.data("changed", false);
        $uploadBox.find(".cert-img-box img").attr("src", downloadUrl);
        saveCertData(function() {
          showSuccessInfo("保存成功", $uploadBox);
          $uploadBox.find('.btns-box .select-file-box').show();
          $uploadBox.find('.btns-box .action-btn-box').hide();
        });
      }
      $uploadBox.find(".uploading-hint-box").hide();
      $ele.removeAttr("disabled");
      $ele.css("cursor", "pointer");
    });
  },
  'click .action-btn-box .btn-cancel': function(e) {
    var ele = e.target, $ele = $(ele);
    var $uploadBox = $ele.closest(".cert-upload-box");

    // cancel change cert image, restore to orig
    $uploadBox.find('.btns-box .select-file-box').show();
    $uploadBox.find('.btns-box .action-btn-box').hide();
    $uploadBox.data("changed", false);
    $uploadBox.find(".cert-img-box img").attr("src", $uploadBox.data("oldImgSrc"));
    $uploadBox.find("input[type=file]")[0].value="";
  },
  'click .btn-add-edu-item': function(e) {
    $proItem = $(".cert-profession-items .cert-upload-box").last().clone();
    clearUploadBox($proItem);
    $proItem.addClass('man-insert');
    $proItem.show();
    $(".cert-profession-items").append($proItem);
    if ($(".cert-profession-items").children().length>=maxProfessionItems) {
      $(e.target).hide();
    }
  },
  'click .btn-delete-item': function(e) {
    if (!confirm("您确定要删除该认证信息吗，删除后不可恢复?")) {
      return;
    }
    $uploadBox = $(e.target).closest(".cert-upload-box");
    if ($(".cert-profession-items").children().length==1) {
      clearUploadBox($uploadBox);
      return;
    }
    $uploadBox.addClass('man-delete');
    $uploadBox.hide();
    saveCertData(function() {
      showSuccessInfo("删除成功", $uploadBox);
    });
    if ($(".cert-profession-items").children(":visible").length<maxProfessionItems) {
      $('.btn-add-edu-item').show();
    }
  },
  'click .btn-save': function(e) {
    saveCertData();
  }
});
