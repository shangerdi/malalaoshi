Meteor.methods({
  generateCoupon: function(courseAttendanceId, count) {
    if(!courseAttendanceId){
      throw new Meteor.Error('参数不足', '必须传入课程ID');
    }
    var curUser = Meteor.user();
    if (!curUser){
      throw new Meteor.Error('权限不足', '当前用户权限不足');
    }
    var courseAttendance = CourseAttendances.findOne({_id: courseAttendanceId});

    if(!courseAttendance || courseAttendance.student.id != curUser._id){
      throw new Meteor.Error('权限不足', '只能抽取自己课程的优惠券');
    }

    var order = Orders.findOne({_id: courseAttendance.detail.orderId});
    if(!order){
      throw new Meteor.Error('数据不正确', '订单不存在');
    }
    var lambda = order.cost / order.hour / 10;
    var ret = [];
    var coupon = Coupons.findOne({courseAttendanceId: courseAttendanceId});
    if(coupon){
      ret[ret.length] = {
        exist: true,
        id: coupon._id,
        value: coupon.value
      }
      return ret;
    }
    for(var i=0; i < count; i++){
      ret[ret.length] = {
        value: Math.floor(normalDistribution(0,lambda))
      }
    }
    ret[0].select = true;
    ret[0].proportion = ret[0].value / lambda;
    var newCoupon = {
      courseAttendanceId: courseAttendanceId,
      value:  ret[0].value,
      minCost: order.cost * 2 / order.hour,
      status: 'new'
    };

    ret[0].id = Coupons.insert(newCoupon);
    return ret;
  }
});
