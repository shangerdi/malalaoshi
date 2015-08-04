Template.orders.onRendered(function () {
  IonNavigation.skipTransitions = true;
});
Template.orders.helpers({
  empty: function(){
    return !this.orders || this.orders.count() === 0;
  }
});
Template.orders.events({
  'click #findTeachers': function(e) {
    e.preventDefault();

    Router.go("teachers");
  }
});
Template.ionNavBar.events({
  'click .btn-settings': function(e) {
    Router.go("parentSettings");
  }
})
