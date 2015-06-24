Template.avatar.onRendered(function(){
  initImageResizer=function(){
    if(Uint8Array&&HTMLCanvasElement&&atob&&Blob){
        
    }else{
        return false;
    }
    var resizer=$(".avatar-edit-box");
    
    resizer.image=resizer.find('img')[0];
    resizer.inner=resizer.find('.inner');
    resizer.frames=resizer.find('.clip-window');
    resizer.frames.offset={
        top:0,
        left:0
    };
    
    resizer.clipImage=function(){
        var nh=this.image.naturalHeight,
            nw=this.image.naturalWidth,
            size=nw>nh?nh:nw;
        size=size>1000?1000:size;
        
        var canvas=(this.find('canvas')&&this.find('canvas')[0])?this.canvas:$('<canvas width="'+size+'" height="'+size+'"></canvas>')[0],
            ctx=canvas.getContext('2d'),
            scale=nw/this.offset.width,
            x=this.frames.offset.left*scale,
            y=this.frames.offset.top*scale,
            w=this.frames.offset.size*scale,
            h=this.frames.offset.size*scale;
        ctx.drawImage(this.image,x,y,w,h,0,0,size,size);

        var canvas180 = $("#imgPreviewCanvas180")[0],
          ctx180 = canvas180.getContext('2d');
        ctx180.drawImage(this.image,x,y,w,h,0,0,180,180);

        var canvas80 = $("#imgPreviewCanvas80")[0],
          ctx80 = canvas80.getContext('2d');
        ctx80.drawImage(this.image,x,y,w,h,0,0,80,80);

        var src=canvas.toDataURL();
        if (!(this.find('canvas')&&this.find('canvas')[0])) {
          this.canvas=canvas;
          this.append(canvas);
        }
        
        src=src.split(',')[1];
        if(!src)return this.doneCallback(null);
        src=window.atob(src);

        var ia = new Uint8Array(src.length);
        for (var i = 0; i < src.length; i++) {
            ia[i] = src.charCodeAt(i);
        };
        
        this.doneCallback(new Blob([ia], {type:"image/png"}));
    };
    
    resizer.resize=function(file,done){
        this.reset();
        this.doneCallback=done;
        this.setFrameSize(0);
        this.frames.css({
            top:0,
            left:0
        });
        var reader=new FileReader();
        reader.onload=function(){
            resizer.image.src=reader.result;
            reader=null;
            resizer.addClass('have-img');
            resizer.setFrames();
            resizer.clipImage();
        };
        reader.readAsDataURL(file);
    };
    
    resizer.reset=function(){
        this.image.src='';
        this.removeClass('have-img');
        this.find('canvas').detach();
    };
    
    resizer.setFrameSize=function(size){
        this.frames.offset.size=size;
        return this.frames.css({
            width:size+'px',
            height:size+'px'
        });
    };
    
    resizer.getDefaultSize=function(){
        // var width=this.inner.width(),
        //     height=this.inner.height();
        var width=$(this.image).width(),
            height=$(this.image).height();
        this.offset={
            width:width,
            height:height
        };
        console.log(this.offset)
        return width>height?height:width;
    };
    
    resizer.moveFrames=function(offset){
        var x=offset.x,
            y=offset.y,
            top=this.frames.offset.top,
            left=this.frames.offset.left,
            size=this.frames.offset.size,
            width=this.offset.width,
            height=this.offset.height;
        
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
        this.frames.css({
            top:y+'px',
            left:x+'px'
        });
        
        this.frames.offset.top=y;
        this.frames.offset.left=x;
    };
    (function(){
        var time;
        function setFrames(){
            var size=resizer.getDefaultSize();
            resizer.setFrameSize(size);
        };
        
        // window.onresize=function(){
        //     clearTimeout(time)
        //     time=setTimeout(function(){
        //         setFrames();
        //     },1000);
        // };
        
        resizer.setFrames=setFrames;
    })();
    
    (function(){
        var lastPoint=null;
        function getOffset(event){
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
        resizer.frames.on('touchstart mousedown',function(event){
            getOffset(event);
        });
        resizer.frames.on('touchmove mousemove',function(event){
            if(!lastPoint)return;
            var offset=getOffset(event);
            resizer.moveFrames(offset);
            resizer.clipImage();
        });
        resizer.frames.on('touchend mouseup',function(event){
            lastPoint=null;
        });
    })();
    return resizer;
  };
  this.resizer=initImageResizer();
});

Template.avatar.events({
  'change #imgFile': function(e) {
    var ele = e.target;
    var imgType = ["gif", "jpeg", "jpg", "bmp", "png"];
    var flag = validImgFile();
    if (!flag) {
      return false;
    }
    var imtUrl = getObjectURL(ele.files[0]);
    var resizer = Template.instance().resizer;
    if (resizer) {
      resizer.resize(ele.files[0],function(file){
        file.name = ele.files[0].name;
        // console.log(file);
        resizer.resizedImage=file;
      });
    }

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
        alert("选择图片类型错误");
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
    var uploader = new Slingshot.Upload("myHeadImgUploads");

    var error = uploader.validate(document.getElementById('imgFile').files[0]);
    if (error) {
      console.error(error);
    }
    var toUploadfile = document.getElementById('imgFile').files[0];
    var resizer = Template.instance().resizer;
    if (resizer && resizer.resizedImage) {
      toUploadfile = resizer.resizedImage;
    }

    uploader.send(toUploadfile, function(error, downloadUrl) {
      if (error) {
        // Log service detailed response
        // console.error('Error uploading', uploader.xhr.response);
        console.error(error);
        alert(error.reason);
      } else {
        console.log(downloadUrl);
        Meteor.users.update(Meteor.userId(), {$set: {"profile.avatarUrl": downloadUrl}});
        // $('.avatar').find("img").attr("src", downloadUrl);
        // $("#avatarUrl").val(downloadUrl);
        // $("#avatarUploadFormBox").addClass('hide');
      }
    });
  }
});
