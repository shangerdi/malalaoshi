var getOrderId = function() {
  return Template.instance().data.orderId;
}
var getTeacherId = function() {
  return Session.get("orderTeacherId");
}
// TODO price of per lesson
var getUnitPrice = function() {
  return 0.01;
}
var getCourseCount = function() {
  var courseCount = Session.get("courseCount");
  return courseCount?courseCount:0;
}
var calcTotalCost = function() {
  var courseCount = getCourseCount();
  return courseCount * getUnitPrice();
}
// TODO discount
var getDiscount = function() {
  return 0;
}
var calcToPayCost = function() {
  return calcTotalCost()-getDiscount();
}
Template.orderStepConfirm.onCreated(function(){
  console.log(getTeacherId());
});
Template.orderStepConfirm.helpers({
  myPhoneNo: function() {
    var a = Meteor.user().phoneNo;
    return a.substr(0,3)+'****'+a.substr(a.length-4);
  },
  timePhases: function() {
    return Session.get("phases");
  },
  convMinutes2Str: function(mins) {
    return ScheduleTable.convMinutes2Str(mins);
  },
  weekdayText: function(d) {
    return '每周'+ScheduleTable.dayNumWords[d];
  },
  courseCount: function() {
    return getCourseCount();
  },
  teacherName: function() {
    var teacherId = getTeacherId();
    var teacher = Meteor.users.findOne({_id:teacherId});
    if (!teacher) {
      return "教师姓名(Error)";
    }
    return teacher.profile.name;
  },
  courseSubject: function() {
    return "年级-科目(TODO)";
  },
  teacherAvatarUrl: function() {
    var teacherId = getTeacherId();
    var teacher = Meteor.users.findOne({_id:teacherId});
    if (!teacher) {
      return "教师头像(Error)";
    }
    return teacher.profile.avatarUrl;
  },
  totalCost: function() {
    return calcTotalCost();
  },
  discount: function() {
    return getDiscount();
  },
  toPayCost: function() {
    return calcToPayCost();
  }
});
Template.orderStepConfirm.events({
  'click #gotoPay': function(e) {
    $(e.currentTarget).addClass("disabled");
    Session.set("orderShowLoading", true);

    var orderId = getOrderId(), curOrder = null;
    if (orderId) {
      curOrder = Orders.findOne({"_id": orderId});
    } else {
      // new order
      var teacherId = getTeacherId(), studentId = Meteor.userId();
      var className = "预约课程(TODO)";
      var hour = getCourseCount();
      var unitCost = getUnitPrice(); // TODO: do not pass price from client
      var cost = calcTotalCost();
      var teacher = Meteor.users.findOne({'_id': teacherId}), student = Meteor.user();

      var school = "", subject = "";
      if(teacher.profile && teacher.profile.subjects){
        var subjects = teacher.profile.subjects[0];
        if(subjects){
          if(subjects.subject){
            subject = getEduSubjectText(subjects.subject);
          }
          if(subjects.school){
            school = getEduSchoolText(subjects.school);
          }
        }
      }
      curOrder = {
        student: {
          id: studentId,
          phoneNo: student.phoneNo,
          name: student.profile.name
        },
        teacher: {
          id: teacherId,
          name: teacher.profile.name
        },
        className: className,
        hour: hour,
        unitCost: unitCost,
        cost: cost,
        subject: school + subject,
        status: "submited"
      };
    }
    curOrder.phases = Session.get("phases");
    curOrder.discount = {'sum': getDiscount()};

    Meteor.call('updateOrder', curOrder, function(error, result) {
      if(error){
        Session.set("orderShowLoading", false);
        $(e.currentTarget).removeClass("disabled");
        return throwError(error.reason);
      }
      Router.go('orderStepPay', {'orderId': result});
    });
  }
});
