Template.registerHelper('isAdmin', function(){
  return Meteor.user() && Meteor.user().role === 'admin';
});
Template.registerHelper('created', function(){
  return moment(this.createdAt).fromNow();
});
Template.registerHelper('isCordova', function(){
  return Meteor.isCordova;
});
Template.registerHelper('isNotCordova', function(){
  return !Meteor.isCordova;
});
