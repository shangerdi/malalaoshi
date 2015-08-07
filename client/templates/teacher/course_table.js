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
  // 查询老师的安排
  var tct = TeacherCourseTables.findOne({"teacher.id": Meteor.userId()});
  if (tct && tct.phases) {
    this.cacheData.availablePhases = tct.phases;
  }
});
Template.courseTable.onRendered(function() {
  $courseTable = $('.course-table');
  var timePhases = this.cacheData.timePhases, availablePhases = this.cacheData.availablePhases;
  // 根据时间段，和老师的时间安排数据，渲染课程表
  _.each(timePhases, function(phase){
    var htmlBuf = '<tr>';
    htmlBuf += '<td class="time-phase">'+convMinutes2Str(phase.start)+' -- '+convMinutes2Str(phase.end)+'</td>';
    for (var i=1; i<=7; i++) {
      var tmp = _.find(availablePhases, function(obj){
        return obj.weekday==i && obj.phase.start==phase.start && obj.phase.end==phase.end;
      });
      htmlBuf += '<td data-weekday="'+i+'" data-start="'+phase.start+'" data-end="'+phase.end+'" class="phase ';
      if (tmp) {
        htmlBuf += 'available">a</td>';
      } else {
        htmlBuf += 'un-available">u</td>';
      }
    }
    htmlBuf += '</tr>';
    $courseTable.append(htmlBuf);
  });
});
Template.courseTable.helpers({
  lessonCounts: function() {
    var tct = TeacherCourseTables.findOne({"teacher.id": Meteor.userId()});
    var availablePhases = (tct && tct.phases)?tct.phases:null;
    return availablePhases?availablePhases.length:0;
  }
});
Template.courseTable.events({
  'click td.phase': function(e) {
    var ele=e.target, $ele = $(ele);
    alert('周'+numWords[$ele.data('weekday')]+"  "+convMinutes2Str($ele.data('start'))+"  "+convMinutes2Str($ele.data('end')));
  }
});
