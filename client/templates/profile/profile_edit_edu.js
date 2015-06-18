Template.profileEditEdu.onCreated(function() {
  Session.set('settingsErrors', {});
});
Template.profileEditEdu.helpers({
  errorMessage: function(field) {
    return Session.get('settingsErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('settingsErrors')[field] ? 'has-error' : '';
  }
});