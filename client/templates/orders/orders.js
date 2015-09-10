Template.orders.onCreated(function(){
  IonNavigation.skipTransitions = true;
  var self = this;
  if(!Session.get('ionTab.current')){
    Session.set('ionTab.current', "ordersNoPaid");
  }
  var paidOrders = Orders.find({"status": {$in: ['paid', 'end']}, "student.id": Meteor.userId()});
  var orderIds = [];
  paidOrders.forEach(function(order){
    if(order.status == 'paid' || order.status == 'end'){
      orderIds[orderIds.length] = order._id;
    }
  });
  this.getOrderLastCourseAttendances = new ReactiveVar();
  Meteor.call('findOrderLastCourseAttendanceEndTime', orderIds, function(error, result) {
    if(error){
      self.getOrderLastCourseAttendances.set(null);
    }else{
      self.getOrderLastCourseAttendances.set(result);
    }
  });
});
Template.orders.onRendered(function (){
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
  },
  reOrder: function(){
    if(this.status != 'paid' && this.status != 'end'){
      return false;
    }
    var thisId = this._id;
    var courseAttendance = Template.instance().getOrderLastCourseAttendances.get();
    var ck = false;
    if(courseAttendance){
      for(var i=0;i<courseAttendance.length;i++){
        if(courseAttendance[i].id == thisId && new Date().getTime() < (courseAttendance[i].endTime + ScheduleTable.timeForRenew)){
          ck = true;
          break;
        }
      }
    }
    return ck;
  }
});
Template.orders.events({
  'click #findTeachers': function(e) {
    e.preventDefault();
    Router.go("teachersFilter");
  },
  'click .order-detail-view-btn-inorders': function(e){
    e.preventDefault();
    Router.go("order", {id: this._id});
  },
  'click .order-detail-submit-btn-onorders': function(e){
    e.preventDefault();
    //TODO do pay
  },
  'click .order-detail-new-order-btn-inorders': function(e){
    e.preventDefault();
    Session.set('orderTeacherId', this.teacher.id);
    Router.go('orderStepSchedule');
  }
});
