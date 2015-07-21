Template.testmail.events({
  'click .btn': function() {
    Meteor.call('sendmail', null, function(error, result) {
      if (error) {
        return throwError(error.reason);
      }
      throwError('Success');
    });
  }
});
