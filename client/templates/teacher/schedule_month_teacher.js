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
  if(month==2) {
    if(moment([year]).isLeapYear()) {
      return 29;
    }
    return 28;
  }
  if(month==4 || month==6 || month==9 || month==11) {
    return 30;
  }
  return 31;
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
var getDateOnlyByTable = function(row, col) {
  var inst = Template.instance();
  var indexFirstDay = inst.cacheData.indexOfFirstDay;
  return d = row*7+col-indexFirstDay+1;
}
var getDateByTable = function(row, col) {
  var inst = Template.instance(), maxDay = inst.cacheData.maxDay, y = inst.data.year, m = inst.data.month;
  var d = getDateOnlyByTable(row, col);
  if (d<1) {
    m-=1;
    if (m==0) {
      y-=1;
      m=12;
    }
    d = getMaxDayOfMonth(y,m)+d;
  } else if (d>maxDay) {
    m+=1;
    if (m==13) {
      y+=1;
      m=1;
    }
    d = col - inst.cacheData.indexOfLastDay;
  }
  return {year:y, month:m, date:d};
}
var findAttendancesByDate = function(date) {
  var role = Meteor.user().role, findParams={};
  if (role==='teacher') {
    findParams["teacher.id"]=Meteor.userId();
  } else {
    findParams["student.id"]=Meteor.userId();
  }
  var year = date.year, month = date.month, day = date.date;
  var targetDay = new Date(year, month-1, day), startTime = targetDay.getTime(), endTime = startTime + ScheduleTable.MS_PER_DAY;
  findParams.attendTime = {$gte: startTime, $lt: endTime};
  return CourseAttendances.find(findParams).fetch();
}
Template.scheduleMonthTeacher.onCreated(function() {
  var year = this.data.year, month = this.data.month;
  console.log(year+"-"+month);
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
    var date = getDateOnlyByTable(row, col);
    if (date<1 || date>Template.instance().cacheData.maxDay) {
      return "";
    }
    return date;
  },
  dateClass: function(row, col) {
    var classStr = "", today = new Date();
    var date = getDateByTable(row, col);
    if (today.getFullYear() == date.year && today.getMonth() == date.month-1 && today.getDate() == date.date) {
      classStr+=" today";
    }
    var items = findAttendancesByDate(date);
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
  'click td.date': function(e) {
    var ele=e.target, $ele = $(ele).closest('td');
    var row = $ele.data("row"), col = $ele.data("col");
    var date = getDateByTable(row, col);
    // alert(JSON.stringify(date));
    var userRole = Meteor.user().role, nowTime = new Date().getTime();
    var items = findAttendancesByDate(date);
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
