var weekFirstDay = 7; // 定义每周的第一天：周日
var cacheData = {};
var getWeekdays = function() {
  if (cacheData.weekdays) {
    return cacheData.weekdays;
  }
  var i, a=[];
  for (i=0; i<7; i++) {
    var d=i+weekFirstDay;
    a.push(d>7?d-7:d);
  }
  cacheData.weekdays = a;
  return a;
}
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
  var y = Session.get('year');
  if (!y) {
    y = cacheData.today.get().getFullYear();
    Session.set('year', y);
  }
  return y;
}
var getCurMonth = function() {
  var m = Session.get('month');
  if (!m) {
    var today = cacheData.today.get();
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
var getIndexFirstDay = function(y,m) {
  if (!cacheData.indexFirstDay) {
    cacheData.indexFirstDay = {};
  }
  var key = y+'_'+m;
  if (cacheData.indexFirstDay[key]) {
    return cacheData.indexFirstDay[key];
  }
  var tmp = getIndexOfWeekday(new Date(y,m-1,1).getDay());
  cacheData.indexFirstDay[key] = tmp;
  return tmp;
}
var getMaxDay = function(y,m) {
  if (!cacheData.maxDay) {
    cacheData.maxDay = {};
  }
  var key = y+'_'+m;
  if (cacheData.maxDay[key]) {
    return cacheData.maxDay[key];
  }
  var tmp = moment([y,m-1]).endOf('month').date();
  cacheData.maxDay[key] = tmp;
  return tmp;
}
var getIndexLastDay = function(y,m) {
  if (!cacheData.indexLastDay) {
    cacheData.indexLastDay = {};
  }
  var key = y+'_'+m;
  if (cacheData.indexLastDay[key]) {
    return cacheData.indexLastDay[key];
  }
  var maxDay = getMaxDay(y,m);
  var tmp = getIndexOfWeekday(new Date(y,m-1,maxDay).getDay());
  cacheData.indexLastDay[key] = tmp;
  return tmp;
}
var getDateByTable = function(m, row, col) {
  var y = getCurYear();
  var indexFirstDay = getIndexFirstDay(y,m), maxDay = getMaxDay(y,m);
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
    d = col - getIndexLastDay(y,m);
  }
  return {year:y, month:m, date:d, flag:flag};
}
var getTdDateClass = function(date) {
  var classStr = "", today = cacheData.today.get();
  if (today.getFullYear() == date.year && today.getMonth() == date.month-1 && today.getDate() == date.date) {
    classStr+=" today";
  }
  if (getViewType()==='month' && getCurMonth()!=date.month) {
    return classStr; // short return: don't show the courses info of not visible date
  }
  var items = ScheduleTable.findAttendancesByDate(Meteor.user(), date);
  if (items && items.length) {
    var nowTime = cacheData.now.get().getTime();
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
var getWeekdayClass = function(weekday) {
  if (weekday==6 || weekday==7 || weekday==0) {
    return "weekend";
  }
  return "";
}
var subscribe = function(year, month, callback) {
  if (_.isFunction(month)) {
    callback = month;
    month = null;
  }
  var param = {find:{},options:{}};
  var role = Meteor.user().role;
  if (role==='teacher') {
    param.find["teacher.id"]=Meteor.userId();
  } else {
    param.find["student.id"]=Meteor.userId();
  }
  var startTime, endTime;
  if (month) {
    startTime = new Date(year, month-1, 1).getTime(), endTime = startTime + 31*ScheduleTable.MS_PER_DAY;
  } else {
    startTime = new Date(year, 0, 1).getTime(), endTime = startTime + 366*ScheduleTable.MS_PER_DAY;
  }
  param.find.attendTime = {$gte: startTime, $lt: endTime};
  Session.set("orderShowLoading", true);
  Meteor.subscribe('courseAttendances', param, function(){
    if (callback) {
      callback();
    }
    Session.set("orderShowLoading", false);
  });
}
var gotoMonth = function(m) {
  var y = getCurYear(), flag = false;
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
    Session.set('year', y);
  }
  subscribe(y,m);
}
var monthNavNumMid = 10;
var monthNavNumCount = 2*monthNavNumMid + 1;
var getMonthNavNum = function() {
  if (cacheData.monthNavNum) {
    return cacheData.monthNavNum;
  }
  var i, a=[];
  for (i=0; i<monthNavNumCount;i++) {
    a.push(i-monthNavNumMid);
  }
  cacheData.monthNavNum = a;
  return a;
}
var initMonthViewSwiper = function() {
  if (cacheData.monthViewSwiper) {
    return;
  }
  cacheData.monthNavSwiper = new Swiper('.month-nav .swiper-container', {
    initialSlide: monthNavNumMid,
    slidesPerView: 7,
    freeMode: true,
    freeModeMomentum: true,
    freeModeMomentumRatio: 0.3,
    freeModeMomentumBounce: true,
    freeModeMomentumBounceRatio: 1,
    freeModeSticky: true,
    centeredSlides: true
  });
  var _monthNavChange = function(swiper){
    var i = swiper.activeIndex, m = getCurMonth();
    i -= monthNavNumMid;
    if (i==0) return;
    m = m + i;
    gotoMonth(m);
    swiper.slideTo(monthNavNumMid, false, true);
  };
  cacheData.monthNavSwiper.on("slideChangeEnd", _monthNavChange);// slideChangeEnd not works well
  cacheData.monthNavSwiper.on("transitionEnd", _monthNavChange);
  cacheData.monthViewSwiper = new Swiper('.month-view .swiper-container', {
    initialSlide: 1
  });
  cacheData.monthViewSwiper.on("slideChangeEnd", function(swiper){
    // console.log('month-view slideChangeEnd');
    var curIdx = swiper.activeIndex, m = getCurMonth();
    if (curIdx>1) {
      m++;
    } else if (curIdx<1)  {
      m--;
    } else {
      return;
    }
    gotoMonth(m);
    swiper.slideTo(1, false, true);
  });
}
var initYearViewSwiper = function() {
  if (cacheData.yearViewSwiper) {
    cacheData.yearViewSwiper.slideTo(1, false, true);
    return;
  }
  cacheData.yearViewSwiper = new Swiper('.year-view-box .swiper-container', {
    direction: 'vertical',
    slidesPerView: 1,
    initialSlide: 1,
    freeMode: true,
    freeModeMomentum: true,
    freeModeMomentumRatio: 0.5,
    freeModeMomentumBounce: true,
    freeModeMomentumBounceRatio: 3,
    freeModeSticky: false
  });
  cacheData.yearViewSwiper.on("slideChangeEnd", function(swiper){
    // console.log('year-view slideChangeEnd');
    $(".prev-year,.next-year").hide();
    var i = swiper.activeIndex;
    if (i==1) {
      return;
    }
    swiper.slideTo(1, false, true);
  });
  cacheData.yearViewSwiper.on("setTranslate", function(swiper){
    // console.log('setTranslate: '+swiper.translate);
    $(".prev-year,.next-year").hide();
    var trans = Math.abs(swiper.translate), h1 = $(swiper.slides[0]).height();
    if (trans < h1) {
      if (h1 - trans >= 200) {
        $(".prev-year,.next-year").show();
        return;
      }
    } else {
      var h2 = $(swiper.slides[1]).height(), slideVisibleHeight = $(window).height()-$('.year-view-box').offset().top;
      var slide2ndBottomTrans = h1+h2-slideVisibleHeight;
      if (trans > slide2ndBottomTrans) {
        if (trans - slide2ndBottomTrans >= 200) {
          $(".prev-year,.next-year").show();
          return;
        }
      }
    }
  });
  cacheData.yearViewSwiper.on("touchEnd", function(swiper){
    // console.log('touchEnd: '+swiper.translate);
    $(".prev-year,.next-year").hide();
    var trans = Math.abs(swiper.translate), h1 = $(swiper.slides[0]).height();
    var diff = 0;
    if (trans < h1) {
      if (h1 - trans < 200) {
        swiper.setWrapperTranslate(-h1);
        return;
      }
      // console.log('go to prev year');
      diff = -1;
    } else {
      var h2 = $(swiper.slides[1]).height(), slideVisibleHeight = $(window).height()-$('.year-view-box').offset().top;
      var slide2ndBottomTrans = h1+h2-slideVisibleHeight;
      if (trans > slide2ndBottomTrans) {
        if (trans - slide2ndBottomTrans < 200) {
          swiper.setWrapperTranslate(-slide2ndBottomTrans);
          return;
        }
        // console.log('go to next year');
        diff = 1;
      }
    }
    if (diff === 0) {
      return;
    }
    var y = getCurYear() + diff;
    Session.set("orderShowLoading", true);
    Session.set('year', y);
    subscribe(y, function() {
      swiper.slideTo(1, false, true);
      Session.set("orderShowLoading", false);
    });
  });
  $(".year-view-box").height($(cacheData.yearViewSwiper.slides[1]).height());
}
Template.scheduleCalendar.onCreated(function(){
  var _now = new Date();
  cacheData.today = new ReactiveVar(_now, function(a,b){
    return (a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate())
  });
  cacheData.now = new ReactiveVar(_now);
  cacheData.nowInterval = Meteor.setInterval(function () {
    var _tmp = new Date();
    cacheData.now.set(_tmp);
    cacheData.today.set(_tmp);
  }, 30000);
});
Template.scheduleCalendar.onDestroyed(function(){
  Meteor.clearInterval(cacheData.nowInterval); // must do
  if (cacheData.yearViewSwiper) {
    cacheData.yearViewSwiper.destroy();
  }
  if (cacheData.monthNavSwiper) {
    cacheData.monthNavSwiper.destroy();
  }
  if (cacheData.monthViewSwiper) {
    cacheData.monthViewSwiper.destroy();
  }
  cacheData = {};
});
Template.scheduleCalendar.onRendered(function(){
  var v = getViewType();
  if (v=='month') {
    $(".year-view-box").hide();
    $(".month-view-box").show();
    subscribe(getCurYear(),getCurMonth());
    initMonthViewSwiper();
  } else {
    $(".month-view-box").hide();
    $(".year-view-box").show();
    subscribe(getCurYear());
    initYearViewSwiper();
  }
});
Template.scheduleCalendar.helpers({
  showLoading: function(){
    return Session.get("orderShowLoading");
  },
  year: function() {
    return getCurYear();
  },
  isShowToToday: function() {
    var v = getViewType(), today = cacheData.today.get();
    if (v!='month') {
      return today.getFullYear() != getCurYear();
    }
    return today.getFullYear() != getCurYear() || today.getMonth() != getCurMonth()-1;
  },
  isMonthView: function() {
    return getViewType()==='month';
  },
  changeViewBtnText: function() {
    var v = getViewType();
    if (v=='month') {
      return "按年";
    }
    return '按月';
  },
  monthNavText: function(i) {
    var m = getCurMonth()
    m = m + i;
    if (m<=0) {
      m+=12;
    }
    if (m>=13) {
      m-=12;
    }
    return (i==0?m+'月':m);
  },
  monthNavClass: function(i) {
    if (i==0) {
      return "cur-month";
    }
    return "";
  },
  monthNavNum: function() {
    return getMonthNavNum();
  },
  monthNum: function() {
    return [1,2,3,4,5,6,7,8,9,10,11,12];
  },
  indexNum: function() {
    return [0,1,2,3,4,5,6];
  },
  weekdays: function() {
    return getWeekdays();
  },
  getWeekdayClass: function(d) {
    return getWeekdayClass(d);
  },
  weekdayText: function(d) {
    return '周'+ScheduleTable.dayNumWords[d];
  },
  weekrows: function(m) {
    var y = getCurYear();
    if (!m) {
      m = getCurMonth();
    }
    var indexFirstDay = getIndexFirstDay(y,m), maxDay = getMaxDay(y,m);
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
    var weekday = getWeekdays()[col];
    return getTdDateClass(date) + " " + getWeekdayClass(weekday);
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
    var weekday = getWeekdays()[col];
    return getTdDateClass(date) + " " + getWeekdayClass(weekday);
  }
});
Template.scheduleCalendar.events({
  'click .btn-go-today': function(e) {
    var v = getViewType(), today = new Date();
    if (getCurYear()!=today.getFullYear()) {
      Session.set('year', today.getFullYear());
    }
    if (v=='month') {
      Session.set('month', today.getMonth()+1);
      subscribe(getCurYear(),getCurMonth());
    } else {
      subscribe(getCurYear());
    }
  },
  'click .btn-change-view': function(e) {
    var v = getViewType();
    if (v=='month') {
      Session.set('view', 'year');
      $('.year-view-box').show();
      $('.month-view-box').hide();
      subscribe(getCurYear());
      initYearViewSwiper();
    } else {
      Session.set('view', 'month');
      $('.year-view-box').hide();
      $('.month-view-box').show();
      subscribe(getCurYear(),getCurMonth());
      initMonthViewSwiper();
    }
  },
  'click .amonth': function(e) {
    var ele=e.target, $ele = $(ele).closest('.amonth');
    var m = $ele.data('month');
    Session.set('month', m);
    Session.set('view', 'month');
    $('.year-view-box').hide();
    $('.month-view-box').show();
    subscribe(getCurYear(),m);
    initMonthViewSwiper();
  },
  'click .month-nav a': function(e) {
    var ele=e.target, $ele = $(ele), i = $ele.data('i'), m = getCurMonth();
    if (i==0) return;
    m = m + i;
    gotoMonth(m);
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
