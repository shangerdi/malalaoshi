Template.avatar.onRendered(function(){
  initImageResizer=function(){
    if(Uint8Array&&HTMLCanvasElement&&atob&&Blob){
        
    }else{
        return false;
    }
    var resizer=$(".avatar-edit-box");
    
    resizer.image=resizer.find('img')[0];
    resizer.inner=resizer.find('.inner');
    resizer.clipWindow=resizer.find('.clip-window');
    resizer.clipWindowMask=resizer.find('.clip-window-mask');
    resizer.clipWindow.rect={
        top:0,
        left:0
    };
    resizer.imageRect={top:0,left:0};
    resizer.minSize={width:150,height:150};
    
    resizer.clipImage=function(){
        var nh=this.image.naturalHeight,
            nw=this.image.naturalWidth,
            size=nw>nh?nh:nw;
        size=size>1000?1000:size;
        
        var canvas=(this.find('canvas')&&this.find('canvas')[0])?this.canvas:$('<canvas width="'+size+'" height="'+size+'" style="display:none;"></canvas>')[0],
            ctx=canvas.getContext('2d'),
            scale=nw/this.imageRect.width,
            x=(this.clipWindow.rect.left-this.imageRect.left)*scale,
            y=(this.clipWindow.rect.top-this.imageRect.top)*scale,
            w=this.clipWindow.rect.size*scale,
            h=this.clipWindow.rect.size*scale;
        ctx.clearRect(0,0,size,size);
        ctx.drawImage(this.image,x,y,w,h,0,0,size,size);

        var $canvasBig = $("#imgPreviewCanvasBig"), widthBig = $canvasBig.width(), heightBig = $canvasBig.height(),
          ctxBig = $canvasBig[0].getContext('2d');
        ctxBig.clearRect(0,0,widthBig,heightBig);
        ctxBig.drawImage(this.image,x,y,w,h,0,0,widthBig,heightBig);

        var $canvasSmall = $("#imgPreviewCanvasSmall"), widthSmall = $canvasSmall.width(), heightSmall = $canvasSmall.height(),
          ctxSmall = $canvasSmall[0].getContext('2d');
        ctxSmall.clearRect(0,0,widthSmall,heightSmall);
        ctxSmall.drawImage(this.image,x,y,w,h,0,0,widthSmall,heightSmall);

        if (!(this.find('canvas')&&this.find('canvas')[0])) {
          this.canvas=canvas;
          this.append(canvas);
        }
        
        if (!canvas.toDataURL) {
          this.clipWindow.hide();
          return this.doneCallback(new Meteor.Error("-100","Your device does not support clip image"));
        }
        var src=canvas.toDataURL("image/jpeg");
        src=src.split(',')[1];
        if(!src)return this.doneCallback(new Meteor.Error("-1","处理失败，请稍后重试"));
        src=window.atob(src);

        var ia = new Uint8Array(src.length);
        for (var i = 0; i < src.length; i++) {
            ia[i] = src.charCodeAt(i);
        };
        
        this.doneCallback(false, new Blob([ia], {type:"image/jpeg"}));
    };
    
    resizer.resize=function(file,done){
        this.reset();
        this.doneCallback=done;
        this.setFrameSize(0);
        this.setFrameLocation(0,0);
        this.inner.show();
        var reader=new FileReader();
        reader.onload=function(){
          resizer.image.src=reader.result;
          reader=null;
          resizer.image.onload=function() {
            if (resizer.image.naturalHeight < resizer.minSize.height || resizer.image.naturalWidth<resizer.minSize.width) {
              return resizer.doneCallback(new Meteor.Error("-2","图像分辨率必须大于"+resizer.minSize.width+" x "+resizer.minSize.height));
            }
            resizer.addClass('have-img');
            resizer.setFrames();
            resizer.clipImage();
          }
        };
        reader.readAsDataURL(file);
    };
    
    resizer.reset=function(){
        this.image.src='';
        this.removeClass('have-img');
        this.inner.hide();
        this.find('canvas').detach();
        this.canvas=null;
    };
    
    resizer.setFrameLocation=function(x,y){
      this.clipWindow.rect.top=y;
      this.clipWindow.rect.left=x;
      return this.clipWindow.css({
        top:y+'px',
        left:x+'px'
      });
    };

    resizer.setFrameSize=function(size){
        this.clipWindow.rect.size=size;
        return this.clipWindow.css({
            width:size+'px',
            height:size+'px'
        });
    };
    
    resizer.getDefaultSize=function(){
        var boxWidth=this.inner.width(),
            boxHeight=this.inner.height(),
            width=$(this.image).width(),
            height=$(this.image).height();
        this.imageRect={
            left: Math.floor((boxWidth - width)/2),
            top: Math.floor((boxHeight - height)/2),
            width:width,
            height:height
        };
        // console.log(this.imageRect)
        return width>height?height:width;
    };

    resizer.setFrames=function(){
      var size=this.getDefaultSize();
      this.setFrameSize(size);
      this.setFrameLocation(this.imageRect.left, this.imageRect.top);
    };

    resizer.resizeFrames=function(x, y) {
      var top=this.clipWindow.rect.top-this.imageRect.top,
          left=this.clipWindow.rect.left-this.imageRect.left,
          size=this.clipWindow.rect.size,
          width=this.imageRect.width,
          height=this.imageRect.height;
      if (x+size<this.minSize.width) {
        return;
      }
      if (y+size<this.minSize.height) {
        return;
      }
      if(x+size+left>width){
        return;
      }
      if(y+size+top>height){
        return;
      }
      this.setFrameSize(x+size);
    };
    
    resizer.moveFrames=function(offset){
        var x=offset.x,
            y=offset.y,
            top=this.clipWindow.rect.top-this.imageRect.top,
            left=this.clipWindow.rect.left-this.imageRect.left,
            size=this.clipWindow.rect.size,
            width=this.imageRect.width,
            height=this.imageRect.height;
        
        if(x+size+left>width){
            x=width-size;
        }else{
            x=x+left;
        };
        
        if(y+size+top>height){
            y=height-size;
        }else{
            y=y+top;
        };
        x=x<0?0:x;
        y=y<0?0:y;
        x += this.imageRect.left;
        y += this.imageRect.top;
        this.setFrameLocation(x,y);
        
        this.clipWindow.rect.top=y;
        this.clipWindow.rect.left=x;
    };
    
    (function(){ // this code block init the handler of mouse event
        var lastPoint=null, action=null;
        function getOffset(event){
          if (!action) {
            return;
          }
          var loc = getLocByEvent(event),
              x=loc.x,
              y=loc.y;
          
          if(!lastPoint){
              lastPoint={
                  x:x,
                  y:y
              };
          };
          
          var offset={
              x:x-lastPoint.x,
              y:y-lastPoint.y
          }
          lastPoint={
              x:x,
              y:y
          };
          return offset;
        };
        function decideAction(event) {
          var loc = getLocByEvent(event),
              x=loc.x,
              y=loc.y;
          var offset = resizer.clipWindow.offset(),
              w = x - offset.left,
              h = y - offset.top;
          var size = resizer.clipWindow.rect.size,
              dx = size - w,
              dy = size - h,
              tolerance = 4;
          // console.log("loc: x: "+x+", y: "+y+"; size: w: "+w+", h: "+h+"; dx:"+dx+", dy:"+dy);
          if (Math.abs(dx)<tolerance) {
            resizer.clipWindowMask.css("cursor", "e-resize");
            action = 'xResize';
          } else if (Math.abs(dy)<tolerance) {
            resizer.clipWindowMask.css("cursor", "s-resize");
            action = 'yResize';
          } else {
            if (w>0 && h>0 && dx>0 && dy>0) {
              resizer.clipWindowMask.css("cursor", "move");
              action = "move";
            } else {
              resizer.clipWindowMask.css("cursor", "default");
              action = null;
            }
          }
        };
        function getLocByEvent(event) {
          event=event.originalEvent;
          var x,y;
          if(event.touches){
            var touch=event.touches[0];
            x=touch.clientX;
            y=touch.clientY;
          }else{
            x=event.clientX;
            y=event.clientY;
          }
          return {x:x,y:y};
        }
        function moveClipWindow(event) {
          if(!lastPoint) {
            decideAction(event);
            return;
          }
          var offset=getOffset(event);
          // console.log(offset);
          if (action=="xResize") {
            resizer.resizeFrames(offset.x, offset.x);
          } else if(action=="yResize") {
            resizer.resizeFrames(offset.y, offset.y);
          } else if(action=="move") {
            resizer.moveFrames(offset);
          }
          resizer.clipImage();
        }
        resizer.clipWindowMask.on('touchstart mousedown',function(event){
          getOffset(event);
        });
        resizer.clipWindowMask.on('touchmove mousemove',function(event){
          moveClipWindow(event);
        });
        resizer.clipWindowMask.on('touchend mouseup',function(event){
          lastPoint=null;
        });
    })();
    return resizer;
  };
  this.resizer=initImageResizer();

  // draw orig avatar
  this.initOrigAvatar = function() {
    // first clear
    var $canvasBig = $("#imgPreviewCanvasBig"), widthBig = $canvasBig.width(), heightBig = $canvasBig.height(),
      ctxBig = $canvasBig[0].getContext('2d');
    ctxBig.clearRect(0,0,widthBig,heightBig);
    var $canvasSmall = $("#imgPreviewCanvasSmall"), widthSmall = $canvasSmall.width(), heightSmall = $canvasSmall.height(),
      ctxSmall = $canvasSmall[0].getContext('2d');
    ctxSmall.clearRect(0,0,widthSmall,heightSmall);
    var curUser = Meteor.user();
    if (curUser && curUser.profile && curUser.profile.avatarUrl) {
      var img=new Image()
      img.src=curUser.profile.avatarUrl;
      img.onload = function() {
        ctxBig.drawImage(img,0,0,widthBig,heightBig);
        ctxSmall.drawImage(img,0,0,widthSmall,heightSmall);
      }
    }
  };
  this.initOrigAvatar();
});
var showError = function(msg) {
  $box = $(".avatar-box");
  $box.addClass('has-error');
  $box.find(".help-block").text(msg);
};
var clearError = function() {
  $box = $(".avatar-box");
  $box.removeClass('has-error');
  $box.find(".help-block").text("");
}
var showSuccessInfo = function(msg) {
  $hintBox = $(".success-hint-box");
  if (msg) {
    $hintBox.find('.text').text(msg);
  }
  $hintBox.show();
  setTimeout(function() {
    $(".success-hint-box").slideUp('normal');
  }, 1200);
}
Template.avatar.events({
  'change #imgFile': function(e) {
    var ele = e.target;
    clearError();
    var imgType = ["gif", "jpeg", "jpg", "bmp", "png"];
    var flag = validImgFile();
    if (!flag) {
      return false;
    }
    $('.btns-box .select-file-box').hide();
    $('.btns-box .action-btn-box').show();
    var resizer = Template.instance().resizer, origFile = ele.files[0], filename = origFile.name, extName=filename.substr(filename.lastIndexOf(".")+1);
    if (resizer) {
      resizer.resize(ele.files[0],function(error, file){
        if (error) {
          $('.btns-box .select-file-box').show();
          $('.btns-box .action-btn-box').hide();
          resizer.reset();
          $('#imgFile').val("");
          showError(error.reason);
          return throwError(error.reason);
        }
        file.name = Date.now()+"."+extName;
        // console.log(file);
        resizer.resizedImage=file;
      });
    }

    // var imtUrl = getObjectURL(ele.files[0]);
    // $("#imgFilePreview1").attr("src", imtUrl);
    // $("#imgFilePreview2").attr("src", imtUrl);
    // $("#imgFilePreview3").attr("src", imtUrl);

    // valid image properties
    function validImgFile() {
      if (!ele.value || !ele.files) {
        // alert("请选择图片文件");
        return false;
      }

      //验证上传文件格式是否正确   
      if (!RegExp("\.(" + imgType.join("|") + ")$", "i").test(ele.value.toLowerCase())) {
        showError("选择图片类型错误");
        this.value = "";
        return false;
      }

      //验证上传文件是否超出了大小   
      // if (ele.files[0].size && (ele.files[0].size / 1024 > 150)) {
      //   alert("您上传的文件大小("+(ele.files[0].size / 1024)+"K)超出了150K限制！");
      //   return false;
      // }

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
  'submit #avatarUploadForm': function(e) {
    e.preventDefault();
    clearError();
    var uploader = new Slingshot.Upload("imgUploads");

    var toUploadfile = document.getElementById('imgFile').files[0];
    var resizer = Template.instance().resizer;
    if (resizer && resizer.resizedImage) {
      toUploadfile = resizer.resizedImage;
    }
    if (!toUploadfile) {
      showError("找不到图片文件");
      return throwError("找不到图片文件");
    }
    var error = uploader.validate(toUploadfile);
    if (error) {
      console.error(error);
      showError(error.reason);
      return throwError(error.reason);
    }

    $('.btns-box .action-btn-box .btn').attr("disabled", true);
    $(".avatar-edit-box .loading-hint-box").show();
    uploader.send(toUploadfile, function(error, downloadUrl) {
      $('.btns-box .action-btn-box .btn').removeAttr("disabled");
      $(".avatar-edit-box .loading-hint-box").hide();
      if (error) {
        // Log service detailed response
        // console.error('Error uploading', uploader.xhr.response);
        console.error(error);
        showError(error.reason);
        return throwError(error.reason);
      } else {
        // console.log(downloadUrl);
        Meteor.users.update(Meteor.userId(), {$set: {"profile.avatarUrl": downloadUrl}});
        showSuccessInfo("保存成功");
        $('.btns-box .select-file-box').show();
        $('.btns-box .action-btn-box').hide();
      }
    });
  },
  'click #avatarUploadForm .btn-cancel': function(e) {
    clearError();
    $('.btns-box .select-file-box').show();
    $('.btns-box .action-btn-box').hide();
    var inst = Template.instance();
    inst.resizer.reset();
    inst.initOrigAvatar();
    $('#imgFile').val("");
  }
});
