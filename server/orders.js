Meteor.methods({
  updateOrder: function(order) {
    var curUser = Meteor.user();
    if (!curUser){
        throw new Meteor.Error('权限不足', "当前用户权限不足");
    }
    order = _.extend(order, {
	     submitUserId: curUser._id,
       submitted: Date.now()
    });

    return Orders.update({_id: updateOrder._id}, {$set: updateOrder}, {upsert: true});
  }
});
