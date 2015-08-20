var getTeacherId = function() {
  return Session.get("orderTeacherId");
}
var getUnitPrice = function() {
  return 400;
}
var getCourseCount = function() {
  var courseCount = Session.get("courseCount");
  return courseCount?courseCount:0;
}
var calcTotalCost = function() {
  var courseCount = getCourseCount();
  return courseCount * getUnitPrice();
}
var getDiscount = function() {
  return 100;
}
var calcToPayCost = function() {
  return calcTotalCost()-getDiscount();
}
Template.orderCourseConfirm.onCreated(function(){
  console.log(getTeacherId());
});
Template.orderCourseConfirm.helpers({
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
Template.orderCourseConfirm.events({
  'click #gotoPay': function(e) {
    Router.go('orderCoursePay');
  }
});
