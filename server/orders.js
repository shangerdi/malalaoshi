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

    if(order._id){
      var old = Orders.findOne(order._id);
      if(!old){
        throw new Meteor.Error('订单不存在', "订单不存在");
      }
      if(curUser.role != "admin" && old.student.id != curUser._id){
        throw new Meteor.Error('权限不足', "不能删除别人的订单");
      }
      return Orders.update({_id: order._id}, {$set: order});
    }else{
      var teacherCount = Meteor.users.find({"_id": order.teacher.id, "role": "teacher", "status.basic": "approved"}).count();
      if(teacherCount == 0){
        throw new Meteor.Error('老师错误', "所选老师状态发生变化，请返回！");
      }

      var count = Orders.find({"student.id": order.student.id, "teacher.id": order.teacher.id, "className": order.className, "subject": order.subject, "status": {$in: ['submited', 'paid']}}).count();
      if(count > 0){
        throw new Meteor.Error('订单错误', "同一老师相同课程只能预约一次！");
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
  }
});
