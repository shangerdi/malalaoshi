Template.headImg.events({
  'change #imgFile': function(e) {
    var ele = e.target;
    var imgType = ["gif", "jpeg", "jpg", "bmp", "png"];
    var flag = validImgFile();
    if (!flag) {
      return false;
    }
    var imtUrl = getObjectURL(ele.files[0]);

    $("#imgFilePreview1").attr("src", imtUrl);
    $("#imgFilePreview2").attr("src", imtUrl);
    $("#imgFilePreview3").attr("src", imtUrl);

    // valid image properties
    function validImgFile() {
      if (!ele.value || !ele.files) {
        alert("请选择图片文件");
        return false;
      }

      //验证上传文件格式是否正确   
      if (!RegExp("\.(" + imgType.join("|") + ")$", "i").test(ele.value.toLowerCase())) {
        alert("选择图片类型错误");
        this.value = "";
        return false;
      }

      //验证上传文件是否超出了大小   
      if (ele.files[0].size && (ele.files[0].size / 1024 > 150)) {
        alert("您上传的文件大小("+(ele.files[0].size / 1024)+"K)超出了150K限制！");
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