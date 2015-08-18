var weekFirstDay = 7; // 定义每周的第一天：周日
var getIndexOfWeekday = function(weekday) {
  var indexWeekday = weekday-weekFirstDay;
  if (indexWeekday<0) indexWeekday+=7;
  return indexWeekday;
}
var getViewType = function() {
  var v = Session.get('view');
  if (!v) {
    v = 'month'; // default view type
    Session.set('view', v);
  }
  return v;
}
var getCurYear = function() {
  return Template.instance().data?Template.instance().data.year:new Date().getFullYear();
}
var getCurMonth = function() {
  var m = Session.get('month');
  if (!m) {
    var today = new Date();
    var y = getCurYear();
    if (y!=today.getFullYear()) {
      m = 1;
    } else {
      m = today.getMonth()+1;
    }
    Session.set('month', m);
  }
  return m;
}
var getDateByTable = function(m, row, col) {
  var y = getCurYear();
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
var getTdDateClass = function(date) {
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
Template.scheduleYear.helpers({
  year: function() {
    return getCurYear();
  },
  isShowToToday: function() {
    var v = getViewType();
    if (v!='month') {
      return true;
    }
    var today = new Date();
    return today.getFullYear() != getCurYear() || today.getMonth() != getCurMonth()-1;
  },
  monthNavText: function(i) {
    var m = getCurMonth()
    m = m + i -3;
    if (m<=0) {
      m+=12;
    }
    if (m>=13) {
      m-=12;
    }
    return (i==3?m+'月':m);
  },
  monthNum: function() {
    return [1,2,3,4,5,6,7,8,9,10,11,12];
  },
  indexNum: function() {
    return [0,1,2,3,4,5,6];
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
    return '周'+ScheduleTable.dayNumWords[d];
  },
  weekrows: function(m) {
    var y = getCurYear();
    if (!m) {
      m = getCurMonth();
    }
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
    return getTdDateClass(date);
  },
  dateText2: function(row, col) {
    var m = getCurMonth();
    var date = getDateByTable(m, row, col);
    if (!date || !date.flag) {
      return "";
    }
    return date.date;
  },
  dateClass2: function(row, col) {
    var m = getCurMonth();
    var date = getDateByTable(m, row, col);
    if (!date || !date.flag) {
      return "";
    }
    return getTdDateClass(date);
  }
});
Template.scheduleYear.events({
  'click .btn-go-today': function(e) {
    var v = getViewType(), today = new Date();
    if (v=='year') {
      v='month';
      $('.year-view-box').hide();
      $('.month-view-box').show();
      $('.btn-change-view').val("按年");
      Session.set('view', v);
    }
    Session.set('month', today.getMonth()+1);
    if (getCurYear()!=today.getFullYear()) {
      Router.go("scheduleYear", {year:today.getFullYear()});
    }
  },
  'click .btn-change-view': function(e) {
    var v = getViewType();
    if (v=='month') {
      v='year';
      $('.year-view-box').show();
      $('.month-view-box').hide();
      e.target.value="按月";
    } else {
      v='month';
      $('.year-view-box').hide();
      $('.month-view-box').show();
      e.target.value="按年";
    }
    Session.set('view', v);
  },
  'click .amonth': function(e) {
    var ele=e.target, $ele = $(ele).closest('.amonth');
    var m = $ele.data('month');
    Session.set('month', m);
    v='month';
    $('.year-view-box').hide();
    $('.month-view-box').show();
    $('.btn-change-view').val("按年");
    Session.set('view', v);
  },
  'click .month-nav a': function(e) {
    var ele=e.target, $ele = $(ele), i = $ele.data('i'), m = getCurMonth(), y = getCurYear(), flag = false;
    i -= 3;
    if (i==0) return;
    m = m + i;
    if (m<=0) {
      y-=1;
      m+=12;
      flag = true;
    }
    if (m>=13) {
      y+=1;
      m-=12;
      flag = true;
    }
    Session.set('month', m);
    if (flag) {
      Router.go("scheduleYear", {year:y});
    }
  },
  'click .month-view td.date': function(e) {
    var ele=e.target, $ele = $(ele).closest('td');
    var m = getCurMonth(), row = $ele.data("row"), col = $ele.data("col");
    var date = getDateByTable(m, row, col);
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
