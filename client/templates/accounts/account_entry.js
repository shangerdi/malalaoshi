var getRole = function() {
  var role = Router.current().params.query.role;
  if (!role) {
    role = 'parent';
  }
  return role;
}
Template.accountEntry.onCreated(function() {
  Session.set("selectedRole", getRole());
});
Template.accountEntry.onRendered(function() {
  var viewHeight = $(window).height();
  $(".account-entry-box").height(viewHeight);
  $(".listbox").css('top', (viewHeight-170)+"px");
});
Template.accountEntry.helpers({
  isParent: function() {
    return getRole()==="parent";
  }
});
