Template.orders.onCreated(function(){
  var self = this;
  if(Session.get('ionTab.current') != 'ordersPaidOk' && Session.get('ionTab.current') != 'ordersNoPaid'){
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
  Meteor.call('findOrderLastCourseAttendanceEndTime', orderIds, function(error, result){
    if(error){
      self.getOrderLastCourseAttendances.set(null);
    }else{
      self.getOrderLastCourseAttendances.set(result);
    }
  });
});
Template.orders.onRendered(function (){
  IonNavigation.skipTransitions = true;
  $('.view').css("background-color","#FFFFFF");
  setMarginBottom();
});
Template.orders.helpers({
  empty: function(){
    return !this.orders || this.orders.count() === 0;
  },
  showOrders: function(){
    var cutTab = Session.get('ionTab.current');
    setMarginBottom();
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
  canRenew: function(){
    if(this.status != 'paid' && this.status != 'end'){
      return false;
    }
    var courseAttendance = Template.instance().getOrderLastCourseAttendances.get();
    if(courseAttendance){
      var obj = courseAttendance[this._id];
      if(obj && obj.canRenew){
        return true;
      }
    }
    return false;
  },
  teacherAvt: function(){
    var tc = Meteor.users.findOne({_id: this.teacher.id});
    return tc && tc.profile ? tc.profile.avatarUrl : "";
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
function setMarginBottom(){
  $('.orders-detail > div:last-child').css('margin-bottom', ($('.orders-detail').height() - 50)+'px');
}
