CouponsController = RouteController.extend({
  waitOn: function() {
    var param = {
      type: 'allUseable'
    };
    return Meteor.subscribe('coupon', param);
  },
  data: function(){
    var get = this.params.get;
    var coupons = Coupons.find({}, {sort: {expireDate: -1}});
    return {
      coupons: coupons,
      getCoupon: get
    }
  }
});
