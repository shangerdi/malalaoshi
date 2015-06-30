Template.userEdit.events({
  'submit form': function(e) {
    e.preventDefault();
    var curForm = e.target;
    var user = {
      role: $(curForm).find('[name=role]').val(),
      id: $(curForm).find('[name=id]').val()
    }

    Meteor.call('updateUserRole', user, function(error, result) {
      if (error)
        return throwError(error.reason);

      Router.go('users');
    });

  }
});
