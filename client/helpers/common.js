Template.registerHelper('created', function(){
  return moment(this.createdAt).fromNow();
});
Template.registerHelper('isCordova', function(){
  return Meteor.isCordova;
});
