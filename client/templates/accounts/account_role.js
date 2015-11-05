var getRole = function() {
  var role = Router.current().params.query.role;
  if (!role) {
    role = Session.get('selectedRole');
  }
  return role;
}
Template.accountRole.onCreated(function() {
  Session.set("selectedRole", getRole());
});
Template.accountRole.helpers({
  isParent: function() {
    return getRole()==="parent";
  }
});
Template.accountRole.events({
  'click .role-teacher': function(e) {
    Session.set("selectedRole", 'teacher');
    $(".account-role-box .btns-box").animate({left: "-50%"}, 'normal');
  },
  'click .role-parent': function(e) {
    Session.set("selectedRole", 'parent');
    $(".account-role-box .btns-box").animate({left: "-50%"}, 'normal');
  },
  'click .btn-login': function(e) {
    IonModal.open('_loginModal', {title:"", type: "login"});
  },
  'click .btn-register': function(e) {
    IonModal.open('_loginModal', {title:"", type: "register"});
  },
  'click .btn-goto-role': function(e) {
    Session.set("selectedRole", '');
    $(".account-role-box .btns-box").animate({left: "0%"}, 'normal');
  }
});
