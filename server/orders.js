Meteor.methods({
  updateOrder: function(order) {
    var curUser = Meteor.user();
    if (!curUser){
      throw new Meteor.Error('权限不足', "当前用户权限不足");
    }
    if(curUser.role != "admin" && order.student.id != curUser._id){
      throw new Meteor.Error('权限不足', "不能操作别人的订单");
    }
    order = _.extend(order, {
	     submitUserId: curUser._id
    });

    // 检测老师的时间安排
    try {
      var curUser = Meteor.user(), teacher = Meteor.users.findOne({'_id':order.teacher.id}), lessonCount = order.hour, phases = order.phases;
      if (phases && _.isArray(phases)) {
        ScheduleTable.generateReserveCourseRecords(curUser, teacher, lessonCount, phases, true);
      }
    } catch (ex) { // 没有异常即表示时间安排没有冲突
      throw ex;
    }

    if(order._id){
      var old = Orders.findOne(order._id);
      if(!old){
        throw new Meteor.Error('订单不存在', "订单不存在");
      }
      if(curUser.role != "admin" && old.student.id != curUser._id){
        throw new Meteor.Error('权限不足', "不能删除别人的订单");
      }
      Orders.update({_id: order._id}, {$set: order});   //TODO only satus can by set.
      return old._id;
    }else{
      //check submit order[price, cost, coupon] matched server
      //TODO check coupon, this for one price more to do.
      var teacherAuditPrice = 0;
      try{
        teacherAuditPrice = TeacherAudit.getTeacherUnitPrice(order.teacher.id);
      }catch(e){}
      if(teacherAuditPrice != order.price || order.price * order.hour - (order.couponValue ? order.couponValue : 0) != order.cost){
        throw new Meteor.Error('单价错误', "老师课程单价已经变化，请返回重新提交！");
      }
      if(order.couponId || order.couponValue){
        var cp = Coupons.findOne({_id: order.couponId, status: 'new'});
        if(!cp || order.couponValue != cp.value){
          throw new Meteor.Error('奖学金信息错误', "奖学金信息错误！");
        }
        order.discount = {
          id: order.couponId,
          value: order.couponValue
        };
      }

      var teacherCount = Meteor.users.find({"_id": order.teacher.id, "role": "teacher", "status.basic": "approved"}).count();
      if(teacherCount == 0){
        throw new Meteor.Error('老师错误', "所选老师状态发生变化，请返回！");
      }

/** //TODO add new rule
      var count = Orders.find({"student.id": order.student.id, "teacher.id": order.teacher.id, "className": order.className, "subject": order.subject, "status": {$in: ['submited', 'paid']}}).count();
      if(count > 0){
        throw new Meteor.Error('订单错误', "同一老师相同课程只能预约一次！");
      }
*/
      if(order.couponId){
        Coupons.update({_id: order.couponId, status: 'new'}, {$set: {status: 'used'}});
      }
      return Orders.insert(order);
    }
  },
  deleteOrder: function(id){
    var curUser = Meteor.user();
    if (!curUser){
      throw new Meteor.Error('权限不足', "当前用户权限不足");
    }

    var order = Orders.findOne(id);
    if(!order){
      throw new Meteor.Error('订单不存在', "订单不存在");
    }
    if(curUser.role != "admin" && order.student.id != curUser._id){
      throw new Meteor.Error('权限不足', "不能删除别人的订单");
    }

    return Orders.update({_id: id}, {$set: {"status": "deleted"}});
  },
  findOrderLastCourseAttendanceEndTime: function(ids){
    var ret = {};
    _.each(ids, function(id){
      var ca = CourseAttendances.findOne({'detail.orderId': id}, {sort: {'endTime': -1}, limit: 1});
      if(ca && ca.endTime){
        ret[id] = {
          canRenew: new Date().getTime() < (ca.endTime + ScheduleTable.timeForRenew)
        };
      }
    });
    return ret;
  }
});
