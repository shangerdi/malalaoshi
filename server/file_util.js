// var fs = Npm.require('fs');

Router.route('/uploadHeadImg/', function(){
  var req = this.request;
  var res = this.response;
  console.log(req.files);
  console.log(this.params);

    // var multiparty = Npm.require('multiparty');
    // var util = Npm.require('util');
    // var form = new multiparty.Form();

    // form.parse(req, function(err, fields, files) {
    //   res.writeHead(200, {'content-type': 'text/plain'});
    //   res.write('received upload:\n\n');
    //   res.end(util.inspect({fields: fields, files: files}));
    // });
  res.end('hello from server');
 return;
}, {where: 'server'});