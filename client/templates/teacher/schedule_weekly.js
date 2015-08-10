var convMinutes2Str = CourseTable.convMinutes2Str;
Template.scheduleWeekly.onCreated(function() {
  // define cache data
  this.cacheData = this.cacheData || {};
  if (!Meteor.user()) {
    this.cacheData.notLogin = true;
    return;
  }
  // 查询时间段
  var address = Meteor.user().profile.address, timePhases=null;
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
Template.scheduleWeekly.helpers({
  lessonCounts: function() {
    var tct = TeacherCourseTables.findOne({"teacher.id": Meteor.userId()});
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
    var tct = TeacherCourseTables.findOne({"teacher.id": Meteor.userId()});
    var availablePhases = (tct && tct.phases)?tct.phases:null;
    var tmp = _.find(availablePhases, function(obj){
      return obj.weekday==i && obj.phase.start==start && obj.phase.end==end;
    });
    if (tmp) {
      return 'available';
    } else {
      return 'un-available';
    }
  },
  getPhaseText: function(i, start, end) {
    var tct = TeacherCourseTables.findOne({"teacher.id": Meteor.userId()});
    var availablePhases = (tct && tct.phases)?tct.phases:null;
    var tmp = _.find(availablePhases, function(obj){
      return obj.weekday==i && obj.phase.start==start && obj.phase.end==end;
    });
    if (tmp) {
      return 'a';
    } else {
      return 'u';
    }
  }
});
Template.scheduleWeekly.events({
  'click td.phase': function(e) {
    var ele=e.target, $ele = $(ele);
    alert('周'+CourseTable.dayNumWords[$ele.data('weekday')]+"  "+convMinutes2Str($ele.data('start'))+"  "+convMinutes2Str($ele.data('end')));
  }
});
