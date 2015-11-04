Template.coupons.onRendered(function(){
  IonNavigation.skipTransitions = true;
});
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

    var iObj = $(e.target).closest('.coupons-list-detail').find('i');
    if(iObj.hasClass('coupon-selected')){
      $('.coupons-list-detail').find('i').removeClass('coupon-selected');
    }else{
      $('.coupons-list-detail').find('i').removeClass('coupon-selected');
      iObj.addClass('coupon-selected');
    }
    var select = {
      id: this._id,
      value: this.value
    };
    Session.set('selectedCoupon', select);
  }
});
