Meteor.methods({
  updateOrder: function(order) {
    var curUser = Meteor.user();
    if (!curUser && curUser.role != "admin"){
      throw new Meteor.Error('权限不足', "当前用户权限不足");
    }
    if(order.student.id != curUser._id){
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
      return Orders.insert(order);
    }
  },
  delete: function(id){
    var curUser = Meteor.user();
    if (!curUser && curUser.role != "admin"){
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
