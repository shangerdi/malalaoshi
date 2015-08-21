var convMinutes2Str = ScheduleTable.convMinutes2Str;
Template.scheduleWeeklyForOrder.onCreated(function() {
  // define cache data
  this.cacheData = this.cacheData || {};
  var teacher = Meteor.users.findOne({_id:this.data.teacherId});
  if (!Meteor.user() || !teacher) {
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
    timePhases = ScheduleTable.defaultTimePhases;
  }
  this.cacheData.timePhases = timePhases.sort(function(a,b){return a.start-b.start;});
});
Template.scheduleWeeklyForOrder.helpers({
  timePhases: function() {
    return Template.instance().cacheData.timePhases;
  },
  days: function() {
    return ScheduleTable.days;
  },
  convMinutes2Str: function(mins) {
    return convMinutes2Str(mins);
  },
  getPhaseState: function(i, start, end) {
    var teacherId = Template.instance().cacheData.teacherId, tct = TeacherAvailableTimes.findOne({"teacher.id": teacherId});
    var availablePhases = (tct && tct.phases)?tct.phases:null;
    var tmp = _.find(availablePhases, function(obj){
      return obj.weekday==i && obj.phase.start==start && obj.phase.end==end;
    });
    if (tmp) {
      var exDays = ScheduleTable.tryDays;// TODO: calculate days to attend experience course.
      var reservedList = ScheduleTable.getWeeklyTeacherReservedList(teacherId, new Date(), exDays);
      var item = _.find(reservedList, function(obj){
        return obj.weekday==i && obj.phase.start==start && obj.phase.end==end;
      });
      if (item) {
        return 'reserved';
      } else {
        return 'available';
      }
    } else {
      return 'unavailable';
    }
  }
});
