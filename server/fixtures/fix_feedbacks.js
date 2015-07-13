if (Feedbacks.find({'created': {'$exists': true}}).count() > 0) {
  var ms = Feedbacks.find({'created': {'$exists': true}});
  ms.forEach(function(m) {
    Feedbacks.update({'_id': m._id}, {'$set': {'createdAt': m.created, 'read': !!m.read}});
  });
  Feedbacks.update({}, {'$unset': {'created': 1}}, {validate: false});
}
