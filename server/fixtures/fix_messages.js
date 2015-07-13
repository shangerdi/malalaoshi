if (Messages.find({'createTime': {'$exists': true}}).count() > 0) {
  var ms = Messages.find({'createTime': {'$exists': true}});
  ms.forEach(function(m) {
    Messages.update({'_id': m._id}, {'$set': {'createdAt': m.createTime, 'read': !!m.read}});
  });
}
