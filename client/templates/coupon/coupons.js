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
  },
  'click .coupons-list-detail': function(e){
    e.preventDefault();

    if(Template.currentData().getCoupon != 'get'){
      return false;
    }

    $('.coupons-list-detail').find('i').removeClass('coupon-selected');
    $(e.target).closest('.coupons-list-detail').find('i').addClass('coupon-selected');
    var select = {
      id: this._id,
      value: this.value
    };
    Session.set('selectedCoupon', select);
  }
});
