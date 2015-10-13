/* 家长端 - 订单列表页面 - controller */
OrdersController = RouteController.extend({
  increment: 200,
  ordersLimit: function() {
    return parseInt(this.params.ordersLimit) || this.increment;
  },
  find: function(){
    if(Meteor.user()){
      return {"status": {$ne: "deleted"}, "student.id": Meteor.user()._id};
    }else{
      return {_id: "0"};
    }
  },
  findOptions: function() {
    var limit = Session.get("ordersLimit");
    if(!limit){
      limit = this.ordersLimit();
      Session.set("ordersLimit", limit);
    }
    return {sort: {createdAt: -1 }, limit: limit};
  },
  parameters: function(){
    return {
      find: this.find(),
      options: this.findOptions()
    }
  },
  waitOn: function() {
    var limit = Session.get("ordersLimit");

    var subscriptionTerms = this.parameters();
    subscriptionTerms.getTeacher = true;

    if(limit){
      subscriptionTerms.options.limit = limit;
    }

    this.ordersSub = Meteor.subscribe('orders', subscriptionTerms);
    return this.ordersSub;
  },
  orders: function(parameters) {
    return Orders.find(parameters.find, parameters.findOptions);
  },
  data: function() {
    var parameters = {
      find: this.find(),
      findOptions: this.findOptions()
    };
    var orders = this.orders(parameters);

    var hasMore = orders.count() === this.ordersLimit();
    var nextPath = this.route.path({teachersLimit: this.ordersLimit() + this.increment});
    return {
      orders: orders,
      ready: this.ordersSub.ready,
      nextPath: hasMore ? nextPath : null,
      terms: this.parameters()
    };
  }
});
