Template.adminOrders.helpers({
  orders: function() {
    return Orders.find({}, {sort:{createdAt:-1}});
  }
});
