Template.couponConfirm.events({
  'click #allCouponBtn': function(e){
    e.preventDefault();
    Router.go('coupons');
  },
  'click #commentBtn': function(e){
    e.preventDefault();
    Router.go('coursesConfirmed');
  }
});
