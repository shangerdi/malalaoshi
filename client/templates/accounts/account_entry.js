var getRole = function() {
  var role = Router.current().params.query.role;
  if (!role) {
    role = Session.get('selectedRole');
  }
  if (!role) {
    role = 'parent';
  }
  return role;
}
Template.accountEntry.onCreated(function() {
  Session.set("selectedRole", getRole());
});
Template.accountEntry.helpers({
  isParent: function() {
    return getRole()==="parent";
  }
});
