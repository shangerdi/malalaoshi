Template.orders.onCreated(function(){
  if(!Session.get('ionTab.current')){
    Session.set('ionTab.current', "ordersNoPaid");
  }
});
Template.orders.onRendered(function (){
  IonNavigation.skipTransitions = true;
  $('.view').css("background-color","#FFFFFF");
});
Template.orders.helpers({
  empty: function(){
    return !this.orders || this.orders.count() === 0;
  },
  showOrders: function(){
    var cutTab = Session.get('ionTab.current');
    if(cutTab == 'ordersNoPaid'){
      return Orders.find({"status": "submited", "student.id": Meteor.userId()}, this.terms.options);
    }else if(cutTab == 'ordersPaidOk'){
      return Orders.find({"status": {$in: ['paid', 'end']}, "student.id": Meteor.userId()}, this.terms.options);
    }
    return null;
  },
  orderTime: function(){
    var momentTime = null;
    return this.createdAt && (momentTime = moment(this.createdAt)) ? (new Date().getTime() - this.createdAt) < 79200000 ? momentTime.fromNow() : momentTime.fromNow() + " " + momentTime.format('HH:mm') : "";
  },
  courseHour: function(){
    return this.hour ? this.hour : "";
  },
  payMoney: function(){
    return this.cost ? accounting.formatNumber(this.cost, 2) : "";
  }
});
Template.orders.events({
  'click #findTeachers': function(e) {
    e.preventDefault();
    Router.go("teachersFilter");
  },
  'click .order-detail-view-btn': function(e){
    e.preventDefault();
    Router.go("order", {id: this._id});
  }
});
