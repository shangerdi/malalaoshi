Meteor.methods({
  updateOrder: function(order) {
    var curUser = Meteor.user();
    if (!Meteor.user()){
        throw new Meteor.Error('权限不足', "当前用户权限不足");
    }
    var updateOrder = _.extend(order, {
	     submitUserId: curUser._id,
       submitted: new Date()
    });

    return Orders.update({_id: updateOrder._id}, {$set: updateOrder}, {upsert: true});
  }
});
