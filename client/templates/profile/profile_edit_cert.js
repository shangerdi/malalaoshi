Template.profileEditCert.events({
  'change .cert-img-box input[type=file]': function(e) {
    var ele = e.target, $ele = $(ele);
    var imgType = ["gif", "jpeg", "jpg", "bmp", "png"];
    var flag = validImgFile();
    if (!flag) {
      return false;
    }
    var imtUrl = getObjectURL(ele.files[0]);

    $ele.closest(".cert-img-box").find('img').attr("src", imtUrl);

    // valid image properties
    function validImgFile() {
      if (!ele.value || !ele.files) {
        // alert("请选择图片文件");
        return false;
      }

      //验证上传文件格式是否正确   
      if (!RegExp("\.(" + imgType.join("|") + ")$", "i").test(ele.value.toLowerCase())) {
        alert("选择图片类型错误");
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
  }
});