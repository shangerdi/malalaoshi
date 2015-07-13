Template.order.helpers({
  phoneNum: function(){
    if(this.order && this.order.student && this.order.student.phoneNo){
      var pn = this.order.student.phoneNo.toString();
      var lth = pn.length;
      var a = lth < 3 ? lth : 3;
      var b = lth < 7 ? lth : 7;
      return pn.substring(0, a) + "****" + pn.substring(b, lth);
    }
  },
  subject: function(){
    return this.order && this.order.teacher ? this.order.teacher.subject : "";
  },
  money: function(val){
    return accounting.formatMoney(val, '');
  },
  formatNum: function(val){
    return accounting.formatNumber(val, 2);
  }
});

Template.order.events({
  'click #btnSaveAndPay': function(e) {
    e.preventDefault();

    Meteor.call('updateOrder', this.order, function(error, result) {
      if (error)
        return throwError(error.reason);

      Router.go("teachers");
    });
  }
});
