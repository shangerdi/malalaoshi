Orders = new Mongo.Collection('orders');

Orders.allow({
  update: function(userId, post) {
    return !! userId;
  },
  remove: function(userId, post) {
    return !! userId;
  },
  insert: function(userId, post) {
    return !! userId;
  }
});
