Template.coupons.helpers({
  empty: function(){
    return this.coupons.count() == 0;
  },
  getDate: function(v){
    return v ? moment(v).format('YYYY年MM月DD日') : '';
  }
});
Template.coupons.events({
  'click #goCoursesComment': function(e){
    e.preventDefault();
    Router.go('coursesConfirmed');
  }
});
