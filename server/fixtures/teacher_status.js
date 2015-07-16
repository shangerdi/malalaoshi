if (Meteor.users.find({'status':{'$exists': true}}).count() < 2) {

  (function (options) {
    var audits = TeacherAudit.find();
    audits.forEach(function(audit) {
      ['basic', 'edu', 'cert'].forEach(function(part) {
        if (audit[part + 'Info']) {
          var status = audit[part + 'Info'].status;
          var setObj = {}
          setObj['status.' + part] = status;
          Meteor.users.update({_id: audit['userId']}, {$set: setObj});
        }
      });
    });
    
  })();
}
