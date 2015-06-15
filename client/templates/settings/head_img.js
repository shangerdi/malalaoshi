Template.headImg.events({
  'change #imgFile': function(e) {
    var ele = e.target;
    console.log(ele);
    var picPath = getPath(ele);
    console.log(picPath);
    var image = new Image();  
   image.src = picPath;
   var flag = validImgFile();
   console.log(flag);

    $("#imgFilePreviewBox").html("<img width='"+image.width+"' height='"+image.height+"' id='aPic' src='"+picPath+"'>");

    // valid image properties
    function validImgFile()  
    {  
   
        //验证上传文件格式是否正确   
        var pos = picPath.lastIndexOf(".");   
        var lastname = picPath.substring(pos, picPath.length)   
        if (lastname.toLowerCase() != ".jpg") {   
            console.log("您上传的文件类型为" + lastname + "，图片必须为 JPG 类型");   
            return false;   
        }   
          
        //验证上传文件宽高比例   
        if (image.height / image.width > 1.5 || image.height / image.width < 1.25) {   
            console.log("您上传的图片比例超出范围，宽高比应介于1.25-1.5");   
            return false;   
        }  
           
        //验证上传文件是否超出了大小   
        if (image.fileSize / 1024 > 150) {   
            console.log("您上传的文件大小超出了150K限制！");   
            return false;   
        }
    } 

    //得到图片的完整路径  
    function getPath(obj)  
    {  
         if(obj)  
         {  
             //ie  
             if (window.navigator.userAgent.indexOf("MSIE")>=1)  
            {  
                obj.select();  
                // IE下取得图片的本地路径  
                return document.selection.createRange().text;  
             }  
             //firefox  
             else if(window.navigator.userAgent.indexOf("Firefox")>=1)  
             {  
                if(obj.files)  
                {  
                 // Firefox下取得的是图片的数据  
                return obj.files.item(0).getAsDataURL();  
                }  
                return obj.value;  
             }  
         return obj.value;  
         }  
    }  
  }
});