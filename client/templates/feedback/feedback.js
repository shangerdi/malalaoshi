Template.feedback.onCreated(function() {
  Session.set('feedbackErrors', {});
});
Template.feedback.helpers({
  errorMessage: function(field) {
    return Session.get('feedbackErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('feedbackErrors')[field] ? 'has-error' : '';
  }
});
Template.feedback.events({
  'submit form': function(e) {
    e.preventDefault();
    var curForm = e.target;
    var content = $(curForm).find('textarea[name="content"]').val();

    Meteor.call('insertFeedback', content, function(error, result) {
      if (error)
        return throwError(error.reason);
      Router.go('dashboard');  
    });
  }
});
