var numWords = ['天','一','二','三','四','五','六','日']
var convMinutes2Str = function(mins) {
  var sH=mins/60, sM=mins%60;
  return (sH<10?'0'+sH:sH)+':'+(sM<10?'0'+sM:sM);
}
Template.courseTable.onCreated(function() {
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
    timePhases = defaultTimePhases;
  }
  this.cacheData.timePhases = timePhases.sort(function(a,b){return a.start-b.start;});
});
Template.courseTable.onRendered(function() {
  // TODO
});
Template.courseTable.helpers({
  lessonCounts: function() {
    var tct = TeacherCourseTables.findOne({"teacher.id": Meteor.userId()});
    var availablePhases = (tct && tct.phases)?tct.phases:null;
    return availablePhases?availablePhases.length:0;
  },
  timePhases: function() {
    return Template.instance().cacheData.timePhases;
  },
  days: function() {
    return [1,2,3,4,5,6,7];
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
Template.courseTable.events({
  'click td.phase': function(e) {
    var ele=e.target, $ele = $(ele);
    alert('周'+numWords[$ele.data('weekday')]+"  "+convMinutes2Str($ele.data('start'))+"  "+convMinutes2Str($ele.data('end')));
  }
});
