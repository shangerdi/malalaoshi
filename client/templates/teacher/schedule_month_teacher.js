var weekFirstDay = 7; // 定义每周的第一天：周日
var getWeekdays = function() {
  var i, a=[];
  for (i=0; i<7; i++) {
    var d=i+weekFirstDay;
    a.push(d>7?d-7:d);
  }
  return a;
}
var getIndexOfWeekday = function(weekday) {
  var indexWeekday = weekday-weekFirstDay;
  if (indexWeekday<0) indexWeekday+=7;
  return indexWeekday;
}
var getMaxDayOfMonth = function(year, month) {
  return moment([year,month-1]).endOf('month').date();
}
var getWeekrows = function() {
  var inst = Template.instance();
  var indexFirstDay = inst.cacheData.indexOfFirstDay, maxDay = inst.cacheData.maxDay;
  var daysInFirstWeek = 7-indexFirstDay;
  var rows = Math.ceil((maxDay-daysInFirstWeek)/7);
  var i, a=[];
  for(i=0; i<=rows; i++) {
    a.push(i);
  }
  return a;
}
var getDateByTable = function(row, col) {
  var inst = Template.instance(), y = inst.data.year, m = inst.data.month;
  var indexFirstDay = inst.cacheData.indexOfFirstDay, maxDay = inst.cacheData.maxDay;
  var d = row*7+col-indexFirstDay+1, flag = true; // is it in this month;
  if (d<1) {
    flag = false;
    m-=1;
    if (m==0) {
      y-=1;
      m=12;
    }
    d = getMaxDayOfMonth(y,m)+d;
  } else if (d>maxDay) {
    flag = false;
    m+=1;
    if (m==13) {
      y+=1;
      m=1;
    }
    d = col - inst.cacheData.indexOfLastDay;
  }
  return {year:y, month:m, date:d, flag:flag};
}
Template.scheduleMonthTeacher.onCreated(function() {
  var year = this.data.year, month = this.data.month;
  // console.log(year+"-"+month);
  this.cacheData = {};
  var maxDay = getMaxDayOfMonth(year, month);
  this.cacheData.maxDay = maxDay;
  var firstDay = new Date(year,month-1,1);
  this.cacheData.firstDay = firstDay;
  this.cacheData.indexOfFirstDay = getIndexOfWeekday(firstDay.getDay());
  var lastDay = new Date(year,month-1,maxDay);
  this.cacheData.lastDay = lastDay;
  this.cacheData.indexOfLastDay = getIndexOfWeekday(lastDay.getDay());
});
Template.scheduleMonthTeacher.helpers({
  isCurrentMonth: function() {
    var today = new Date(), instData = Template.instance().data;
    return today.getFullYear() == instData.year && today.getMonth() == instData.month-1;
  },
  indexNum: function() {
    return [0,1,2,3,4,5,6];
  },
  monthNavUrl: function(i) {
    i = i-3;
    var data = Template.instance().data, m = data.month+i, y = data.year;
    if (m<=0) {
      y-=1;
      m+=12;
    }
    if (m>=13) {
      y+=1;
      m-=12;
    }
    return Router.current().route.path({monthStr:y+'-'+m});
  },
  monthNavText: function(i) {
    i = i-3;
    var m = Template.instance().data.month+i;
    if (m<=0) {
      m+=12;
    }
    if (m>=13) {
      m-=12;
    }
    return (i==0?m+'月':m);
  },
  weekdays: function() {
    return getWeekdays();
  },
  weekdayText: function(d) {
    return '周'+ScheduleTable.dayNumWords[d];
  },
  weekrows: function() {
    return getWeekrows();
  },
  dateText: function(row, col) {
    var date = getDateByTable(row, col);
    if (!date || !date.flag) {
      return "";
    }
    return date.date;
  },
  dateClass: function(row, col) {
    var date = getDateByTable(row, col);
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
Template.scheduleMonthTeacher.events({
  'click .btn-go-today': function(e) {
    Router.go(Router.current().route.path());
  },
  'click .btn-go-year-view': function(e) {
    Router.go(Router.path('scheduleYear', {year:Template.instance().data.year}));
  },
  'click td.date': function(e) {
    var ele=e.target, $ele = $(ele).closest('td');
    var row = $ele.data("row"), col = $ele.data("col");
    var date = getDateByTable(row, col);
    // alert(JSON.stringify(date));
    var curUser = Meteor.user(), userRole = curUser.role, nowTime = new Date().getTime();
    var items = ScheduleTable.findAttendancesByDate(curUser, date);
    if (items) {
      $courseItemsTable = $(".course-items-table");
      $courseItemsTable.children().remove();
      _.each(items, function(obj){
        var state=obj.state, stateStr="";
        if (state==ScheduleTable.attendanceStateDict["reserved"].value) {
          if (obj.attendTime>nowTime) {
            stateStr="待上课";
          } else if (obj.endTime<=nowTime) {
            stateStr="待确认";
          } else {
            stateStr="上课中";
          }
        } else if (state==ScheduleTable.attendanceStateDict["attended"].value) {
          stateStr="待评价";
        } else if (state==ScheduleTable.attendanceStateDict["commented"].value) {
          stateStr="已评价";
        }
        var itemHtml = '<tr><td>'+ScheduleTable.convMinutes2Str(obj.phase.start)+'——'+ScheduleTable.convMinutes2Str(obj.phase.end)+'</td>'
          +'<td>'+(userRole==='teacher'?obj.student.name:obj.teacher.name)+'</td><td>课程名字TODO</td><td>上课地点TODO</td><td>'+stateStr+'</td>'
          +'</tr>';
        $courseItemsTable.append(itemHtml);
      });
    }
  }
});
