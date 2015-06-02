Template.settings.onCreated(function() {
  Session.set('settingsErrors', {});
});
Template.settings.helpers({
  errorMessage: function(field) {
    return Session.get('settingsErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('settingsErrors')[field] ? 'has-error' : '';
  }
});
Template.settings.events({
  'submit form': function(e) {
    e.preventDefault();

    var profile = {
      name: $(e.target).find('[name=name]').val()
    }

    var errors = validateProfile(profile);
    if (errors.name)
      return Session.set('settingsErrors', errors);

    Meteor.call('updateProfile', profile, function(error, result) {
      if (error)
        return throwError(error.reason);

      Router.go('profile');  
    });
  }
});
