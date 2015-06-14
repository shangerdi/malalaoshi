// console.log(process.env.NODE_PATH);
console.log(process);
// var multiparty = Npm.require('multiparty');
var util = Npm.require('util');
var fs = Npm.require('fs');
var path = Npm.require('path') ;

Router.route('/uploadHeadImg/', function(){
  var req = this.request;
  var res = this.response;
  // console.log(req.files);
  // console.log(this.params);

    var multiparty = Npm.require('multiparty');
    var form = new multiparty.Form();

    form.parse(req, function(err, fields, files) {
      console.log(files);
      if (files && files.imgFile && files.imgFile.length>0) {
        var fileObj = files.imgFile[0];
        var tmpPath = fileObj.path;
        var webPath = "/images/"+path.basename(tmpPath);
        var newPath = path.normalize(process.env.METEOR_SHELL_DIR+"/../../..")+"/public"+webPath;
        console.log(newPath);
        try {
          copyFile(tmpPath, newPath);
          res.writeHead(200, {'content-type': 'text/plain'});
          res.write('received upload:\n\n');
          res.end(util.inspect({"code": 0, "path": webPath}));
          return;
        } catch (err) {
          console.log(err);
          res.end(util.inspect({"code": -1, "err": err}));
          return;
        }
      } else {
        res.end(util.inspect({"code": 1, "msg": "参数错误"}));
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