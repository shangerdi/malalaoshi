Template.orderCourseConfirm.onCreated(function(){
  console.log(Session.get("orderTeacherId"));
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
    return '周'+ScheduleTable.dayNumWords[d];
  },
  courseCount: function() {
    return Session.get("courseCount");
  },
  teacherName: function() {
    var teacherId = Session.get("orderTeacherId");
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
    var teacherId = Session.get("orderTeacherId");
    var teacher = Meteor.users.findOne({_id:teacherId});
    if (!teacher) {
      return "教师头像(Error)";
    }
    return teacher.profile.avatarUrl;
  }
});
Template.orderCourseConfirm.events({
  'click #gotoPay': function(e) {
    Router.go('orderCoursePay');
  }
});
