var multiparty = Npm.require('multiparty');
var fs = Npm.require('fs');
var path = Npm.require('path') ;

Router.route('/uploadHeadImg/', function(){
  var req = this.request;
  var res = this.response;
  // console.log(req.files);
  // console.log(this.params);

    // var multiparty = Npm.require('multiparty');
    var form = new multiparty.Form();

    form.parse(req, function(err, fields, files) {
      console.log(fields);
      console.log(files);
      if (files && files.imgFile && files.imgFile.length>0 && files.imgFile[0].originalFilename && files.imgFile[0].size) {
        var fileObj = files.imgFile[0];
        var tmpPath = fileObj.path;
        var webPath = "/images/"+path.basename(tmpPath);
        var newPath = path.normalize(process.env.FILES_SERVER_ROOT)+webPath;
        console.log(newPath);
        try {
          copyFile(tmpPath, newPath);
          res.writeHead(200, {'content-type': 'text/plain'});
          res.end(JSON.stringify({"code": 0, "path": webPath, "server": process.env.FILES_SERVER}));
          return;
        } catch (err) {
          console.log(err);
          res.end(JSON.stringify({"code": -1, "err": err}));
          return;
        }
      } else {
        res.end(JSON.stringify({"code": 1, "msg": "参数错误"}));
        return;
      }
    });

}, {where: 'server'});

copyFile = function(sourcePath, destinationPath) {
  // 创建读取流
  readable = fs.createReadStream( sourcePath );
  // 创建写入流
  writable = fs.createWriteStream( destinationPath );   
  // 通过管道来传输流
  readable.pipe( writable );
}