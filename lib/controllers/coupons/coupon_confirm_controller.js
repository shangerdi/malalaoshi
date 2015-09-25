CouponConfirmController = RouteController.extend({
  waitOn: function() {
    var couponId = this.params.id;
    var param = {
      id: couponId
    };
    return Meteor.subscribe('coupon', param);
  },
  data: function(){
    var couponId = this.params.id;
    var coupon = Coupons.findOne({_id: couponId});
    return {
      coupon: coupon
    }
  }
});
