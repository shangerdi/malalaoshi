Template.registerHelper('isAdmin', function(){
  return Meteor.user() && Meteor.user().role === 'admin';
});
Template.registerHelper('isParent', function(){
  return Meteor.user() && Meteor.user().role === 'parent';
});
Template.registerHelper('created', function(){
  return moment(this.createdAt).fromNow();
});
Template.registerHelper('isParentOrAdmin', function(){
  return Meteor.user() && (Meteor.user().role === 'admin' || Meteor.user().role === 'parent');
});
