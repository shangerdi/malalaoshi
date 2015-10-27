var getTeacherId = function() {
  return Session.get("orderTeacherId");
}
var getCourseCount = function() {
  var courseCount = Session.get("courseCount");
  return courseCount?courseCount:0;
}
Template.order.onCreated(function(){
  this.selectedCoupon = new ReactiveVar(Session.get('selectedCoupon'));
  Session.set('selectedCoupon', null);
});
Template.order.onRendered(function () {
  IonNavigation.skipTransitions = true;
  Session.set("orderShowLoading", false);
});
Template.order.helpers({
  showLoading: function(){
    return Session.get("orderShowLoading");
  },
  phoneNum: function(){
    if(this.order && this.order.student && this.order.student.phoneNo){
      var pn = this.order.student.phoneNo.toString();
      var lth = pn.length;
      var a = lth < 3 ? lth : 3;
      var b = lth < 7 ? lth : 7;
      return pn.substring(0, a) + "****" + pn.substring(b, lth);
    }
  },
  timePhases: function() {
    return this.order._id ? this.order.phases : Session.get("phases");
  },
  weekdayText: function(d) {
    return '每周'+ScheduleTable.dayNumWords[d];
  },
  courseCount: function() {
    return this.order._id ? this.order.hour : getCourseCount();
  },
  subject: function(){
    return this.order ? this.order.subject : "";
  },
  money: function(val){
    return accounting.formatMoney(val, '');
  },
  formatNum: function(val){
    return accounting.formatNumber(val, 2);
  },
  error: function(){
    return (this.student && this.teacher) ? "" : "disabled";
  },
  teacherStudyCenters: function(){
    var pointBasic = Session.get("locationLngLat");
    var retStudyCenters = [];
    if(this.studyCenters){
      this.studyCenters.forEach(function(element){
        element.distance = pointBasic ? calculateDistance({lat: element.lat, lng: element.lng}, pointBasic) : null;
        retStudyCenters[retStudyCenters.length] = element;
      });
    }
    retStudyCenters.sort(compDistance);
    return retStudyCenters;
  },
  studyAddress: function(){
    return this.order._id ? this.order.address : Session.get("locationAddress");
  },
  totalCost: function(){
    return this.order._id ? this.order.cost : cmpTotalCost(this);
  },
  toPayCost: function(){
    return cmpToPayCost(this);
  },
  couponId: function(){
    var cp = Template.instance().selectedCoupon ? Template.instance().selectedCoupon.get() : null;
    return cp && cp.id;
  },
  couponValue: function(){
    var cp = Template.instance().selectedCoupon ? Template.instance().selectedCoupon.get() : null;
    return cp ? cp.value : "";
  }
});

Template.order.events({
  'click #btnSaveAndPay': function(e) {
    e.preventDefault();
    $(e.currentTarget).addClass("disabled");
    Session.set("orderShowLoading", true);

    if (!this.order._id) {
      this.order.hour = getCourseCount();
      this.order.cost = cmpToPayCost(this);
      this.order.price = getTeacherUnitPrice(this);
      this.order.phases = Session.get("phases");

      var cp = Template.instance().selectedCoupon ? Template.instance().selectedCoupon.get() : null;
      if(cp){
        this.order.couponId = cp.id;
        this.order.couponValue = cp.value;
      }
    }
    if($('#addressDetail').val()){
      this.order.addressDetail = $('#addressDetail').val();
    }

    var lngLat = Session.get("locationLngLat");
    if(lngLat){
      this.order.lng = lngLat.lng;
      this.order.lat = lngLat.lat;
    }
    Meteor.call('updateOrder', this.order, function(error, result) {
      if(error){
        Session.set("orderShowLoading", false);
        $(e.currentTarget).removeClass("disabled");
        return throwError(error.reason);
      }
      Router.go('orderStepPay', {'orderId': result});
    });
  },
  'click #btnDelete': function(e){
    e.preventDefault();

    if(this.order && this.order._id){
      Meteor.call('deleteOrder', this.order._id, function(error, result) {
        if (error)
          return throwError(error.reason);

        Router.go("orders");
      });
    }
  },
  'click .item-icon-right': function(e){
    e.preventDefault();

    Router.go('coupons', {get: 'get'});
  }
});
function cmpTotalCost(content){
  return getCourseCount() * getTeacherUnitPrice(content);
}
function cmpToPayCost(content){
  var cp = Template.instance().selectedCoupon ? Template.instance().selectedCoupon.get() : null;
  return cmpTotalCost(content) - (cp ? cp.value : 0);
}
function getTeacherUnitPrice(content){
  try {
    return content && content.teacher ? TeacherAudit.getTeacherUnitPrice(content.teacher._id) : 0;
  }catch(e){
    console.log(e);
  }finally{
    return 0;
  }
}
