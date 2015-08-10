var convMinutes2Str = CourseTable.convMinutes2Str;
Template.scheduleWeeklyForOrder.onCreated(function() {
  // define cache data
  this.cacheData = this.cacheData || {};
  var teacher = Meteor.users.findOne({_id:Router.current().params.teacherId});
  if (!Meteor.user() && !teacher) {
    this.cacheData.notLogin = true;
    return;
  }
  this.cacheData.teacherId = teacher._id;
  this.cacheData.teacher = teacher;
  // 查询时间段
  var address = teacher.profile.address, timePhases=null;
  if (!timePhases && address.district.code) {
    timePhases = AreaTimePhases.findOne({code: address.district.code});
  }
  if (!timePhases && address.city.code) {
    timePhases = AreaTimePhases.findOne({code: address.city.code});
  }
  if (!timePhases && address.province.code) {
    timePhases = AreaTimePhases.findOne({code: address.province.code});
  }
  if (!timePhases) {
    timePhases = CourseTable.defaultTimePhases;
  }
  this.cacheData.timePhases = timePhases.sort(function(a,b){return a.start-b.start;});
});
Template.scheduleWeeklyForOrder.helpers({
  lessonCounts: function() {
    var tct = TeacherCourseTables.findOne({"teacher.id": Template.instance().cacheData.teacherId});
    var availablePhases = (tct && tct.phases)?tct.phases:null;
    return availablePhases?availablePhases.length:0;
  },
  timePhases: function() {
    return Template.instance().cacheData.timePhases;
  },
  days: function() {
    return CourseTable.days;
  },
  convMinutes2Str: function(mins) {
    return convMinutes2Str(mins);
  },
  getPhaseState: function(i, start, end) {
    var tct = TeacherCourseTables.findOne({"teacher.id": Template.instance().cacheData.teacherId});
    var availablePhases = (tct && tct.phases)?tct.phases:null;
    var tmp = _.find(availablePhases, function(obj){
      return obj.weekday==i && obj.phase.start==start && obj.phase.end==end;
    });
    if (tmp) {
      var now = new Date(), todayTime = new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime(), aWeekLaterTime = todayTime+7*24*60*60*1000;
      var reservedList = CourseAttendances.find({"teacher.id":Template.instance().cacheData.teacherId, attendDay: {$gte: todayTime, $lt: aWeekLaterTime}}).fetch();
      var item = _.find(reservedList, function(obj){
        var tmpDate = new Date(obj.attendDay), weekday = tmpDate.getDay();
        weekday = (weekday==0?7:weekday);
        return weekday==i && obj.phase.start==start && obj.phase.end==end;
      });
      if (item) {
        return 'reserved';
      } else {
        return 'available';
      }
    } else {
      return 'un-available';
    }
  },
  getPhaseText: function(i, start, end) {
    var tct = TeacherCourseTables.findOne({"teacher.id": Template.instance().cacheData.teacherId});
    var availablePhases = (tct && tct.phases)?tct.phases:null;
    var tmp = _.find(availablePhases, function(obj){
      return obj.weekday==i && obj.phase.start==start && obj.phase.end==end;
    });
    if (tmp) {
      var now = new Date(), todayTime = new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime(), aWeekLaterTime = todayTime+7*24*60*60*1000;
      var reservedList = CourseAttendances.find({"teacher.id":Template.instance().cacheData.teacherId, attendDay: {$gte: todayTime, $lt: aWeekLaterTime}}).fetch();
      var item = _.find(reservedList, function(obj){
        var tmpDate = new Date(obj.attendDay), weekday = tmpDate.getDay();
        weekday = (weekday==0?7:weekday);
        return weekday==i && obj.phase.start==start && obj.phase.end==end;
      });
      if (item) {
        return 'r';
      } else {
        return 'a';
      }
    } else {
      return 'u';
    }
  }
});
Template.scheduleWeeklyForOrder.events({
  'click td.phase': function(e) {
    var ele=e.target, $ele = $(ele);
    alert('周'+CourseTable.dayNumWords[$ele.data('weekday')]+"  "+convMinutes2Str($ele.data('start'))+"  "+convMinutes2Str($ele.data('end')));
  }
});
