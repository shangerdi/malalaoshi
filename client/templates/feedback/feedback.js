var seenFeedback = function(e) {
  e.preventDefault();
  var curForm = $('form');
  var content = $(curForm).find('textarea[name="content"]').val();
  content = content.trim();
  if (!content) {
    var errors = Session.get('feedbackErrors');
    errors['content'] = "内容不能为空";
    Session.set('feedbackErrors', errors);
  }
  var contact = $(curForm).find('input[name="contact"]').val();

  Meteor.call('insertFeedback', content, contact, function(error, result) {
    if (error) {
      return throwError(error.reason);
    }
    
    if (Meteor.isCordova) {
      navigator.app && navigator.app.backHistory && navigator.app.backHistory();
    } else {
      history.back();
    }
  });
}
Template.feedback.onCreated(function() {
  Session.set('feedbackErrors', {});
});
Template.feedback.onRendered(function(){
  $("[data-action=send-feedback]").click(seenFeedback);
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
  'submit form, click .btn-send-feedback': function(e) {
    seenFeedback(e);
  },
  'keyup .form, change .form': function(e) {
    var curForm = $('form');
    var content = $(curForm).find('textarea[name="content"]').val();
    content = content.trim();
    if (content) {
      var errors = Session.get('feedbackErrors');
      errors['content'] = null;
      Session.set('feedbackErrors', errors);
    }
  }
});
