Template.order.helpers({
  phoneNum: function(){
    if(this.student && this.student.phoneNo){
      var pn = this.student.phoneNo.toString();
      var lth = pn.length;
      var a = lth < 3 ? lth : 3;
      var b = lth < 7 ? lth : 7;
      return pn.substring(0, a) + "****" + pn.substring(b, lth);
    }
  },
  subject: function(){
    var school = "", subject = "";
    if(this.teacher && this.teacher.profile && this.teacher.profile.subjects){
      var subjects = this.teacher.profile.subjects[0];
      if(subjects){
        if(subjects.subject){
          subject = getEduSubjectText(subjects.subject);
        }
        if(subjects.school){
          school = getEduSchoolText(subjects.school);
        }
      }
    }
    return school + subject;
  },
  money: function(val){
    return accounting.formatMoney(val, '');
  },
  formatNum: function(val){
    return accounting.formatNumber(val, 2);
  }
});

Template.order.events({
  'click #submitBtnSaveOrderPayfor': function(e) {
    e.preventDefault();

    Meteor.call('updateOrder', this.order, function(error, result) {
      if (error)
        return throwError(error.reason);

      Router.go("teachers");
    });
  }
});
