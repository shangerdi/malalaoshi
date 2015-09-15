Template.mineProfilePhotos.helpers({
  photoList: function() {
    var teacherAudit = TeacherAudit.findOne({'userId': Meteor.userId()});
    if (teacherAudit) {
      return teacherAudit.personalPhoto;
    }
  }
});
Template.mineProfilePhotos.events({
  'change input[type=file]': function(e) {
    var ele = e.target, $ele = $(ele);
    var imgType = ["gif", "jpeg", "jpg", "bmp", "png"];
    var flag = validImgFile();
    if (!flag) {
      return false;
    }
    
    var file = ele.files[0];
    var uploader = new Slingshot.Upload("imgUploads");
    var error = uploader.validate(file);
    if (error) {
      console.log(error);
      alert(error.reason);
      return false;
    }
    // ready to upload
    $ele.attr("disabled", true);
    $ele.css("cursor", "wait");
    uploader.send(file, function(error, downloadUrl) {
      if (error) {
        console.log(error);
        alert(error.reason);
        $ele.removeAttr("disabled");
        $ele.css("cursor", "pointer");
        return;
      }
      // console.log(downloadUrl);
      // do save downloadUrl to db
      Meteor.call('addPersonalPhoto', downloadUrl, function(error, result) {
        $ele.removeAttr("disabled");
        $ele.css("cursor", "pointer");
        if (error) {
          console.log(error);
          alert(error.reason);
          return throwError(error.reason);
        }
        alert("添加成功");
        ele.value=null;
      });
    });

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
  }
});
