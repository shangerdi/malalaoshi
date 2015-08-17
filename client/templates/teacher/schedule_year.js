var weekFirstDay = 7; // 定义每周的第一天：周日
var getIndexOfWeekday = function(weekday) {
  var indexWeekday = weekday-weekFirstDay;
  if (indexWeekday<0) indexWeekday+=7;
  return indexWeekday;
}
var getDateByTable = function(m, row, col) {
  var inst = Template.instance(), y = inst.data?inst.data.year:new Date().getFullYear();
  var indexFirstDay = getIndexOfWeekday(new Date(y,m-1,1).getDay()), maxDay = moment([y,m-1]).endOf('month').date();
  var d = row*7+col-indexFirstDay+1;
  var flag = true; // is it in this month
  if (d<1) {
    flag = false;
    m-=1;
    if (m==0) {
      y-=1;
      m=12;
    }
    d = moment([y,m-1]).endOf('month').date()+d;
  } else if (d>maxDay) {
    flag = false;
    m+=1;
    if (m==13) {
      y+=1;
      m=1;
    }
    d = col - getIndexOfWeekday(new Date(y,m-1,maxDay).getDay());
  }
  return {year:y, month:m, date:d, flag:flag};
}
Template.scheduleYear.helpers({
  year: function() {
    return Template.instance().data?Template.instance().data.year:new Date().getFullYear();
  },
  monthNum: function() {
    return [1,2,3,4,5,6,7,8,9,10,11,12];
  },
  indexNum: function() {
    return [0,1,2,3,4,5,6];
  },
  getPathForScheduleMonth: function(m) {
    var y = Template.instance().data?Template.instance().data.year:new Date().getFullYear();
    return Router.path('scheduleMonth', {monthStr:y+'-'+m});
  },
  weekdays: function() {
    var i, a=[];
    for (i=0; i<7; i++) {
      var d=i+weekFirstDay;
      a.push(d>7?d-7:d);
    }
    return a;
  },
  weekdayText: function(d) {
    return ScheduleTable.dayNumWords[d];
  },
  weekrows: function(m) {
    var inst = Template.instance(), y = inst.data?inst.data.year:new Date().getFullYear();
    var indexFirstDay = getIndexOfWeekday(new Date(y,m-1,1).getDay()), maxDay = moment([y,m-1]).endOf('month').date();
    var daysInFirstWeek = 7-indexFirstDay;
    var rows = Math.ceil((maxDay-daysInFirstWeek)/7);
    var i, a=[];
    for(i=0; i<=rows; i++) {
      a.push(i);
    }
    return a;
  },
  dateText: function(m, row, col) {
    var date = getDateByTable(m, row, col);
    if (!date || !date.flag) {
      return "";
    }
    return date.date;
  },
  dateClass: function(m, row, col) {
    var date = getDateByTable(m, row, col);
    if (!date || !date.flag) {
      return "";
    }
    var classStr = "", today = new Date();
    if (today.getFullYear() == date.year && today.getMonth() == date.month-1 && today.getDate() == date.date) {
      classStr+=" today";
    }
    var items = ScheduleTable.findAttendancesByDate(Meteor.user(), date);
    if (items && items.length) {
      var nowTime = new Date().getTime();
      var unfinished = _.some(items, function(obj){
        return obj.endTime>nowTime && obj.state==ScheduleTable.attendanceStateDict["reserved"].value;
      });
      if (unfinished) {
        classStr+=" todo";
      } else {
        classStr+=" done";
      }
    }
    return classStr;
  }
});
Template.scheduleYear.events({
  'click .btn-go-today, click .btn-go-month-view': function(e) {
    Router.go(Router.path('scheduleMonth'));
  },
  'click .amonth .table': function(e) {
    var ele=e.target, $ele = $(ele).closest('table');
    var m = $ele.data('month');
    var y = Template.instance().data?Template.instance().data.year:new Date().getFullYear();
    Router.go(Router.path('scheduleMonth', {monthStr:y+'-'+m}));
  }
});
