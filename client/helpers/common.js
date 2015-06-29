Template.registerHelper('isAdmin', function(){
  return Meteor.user() && Meteor.user().role === 'admin';
});
