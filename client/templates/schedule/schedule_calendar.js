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
var getWeekrowsCount = function(m) {
  var y = getCurYear();
  if (!m) {
    m = getCurMonth();
  }
  var indexFirstDay = getIndexFirstDay(y,m), maxDay = getMaxDay(y,m);
  var daysInFirstWeek = 7-indexFirstDay;
  return Math.ceil((maxDay-daysInFirstWeek)/7)+1;
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
var appendMonthBodyText = function(buf, m) {
  buf.push('<tbody>');
  var rows = getWeekrowsCount(m);
  for (var r=0; r<rows; r++) {
    buf.push('<tr>');
    for (var i=0; i<7; i++) {
      var tdDateClass = '', dateText = '';
      var date = getDateByTable(m, r, i);
      if (date && date.flag) {
        tdDateClass = getTdDateClass(date);
        dateText = date.date;
      }
      buf.push('<td class="date '+tdDateClass+'" data-row="'+r+'" data-col="'+i+'"><div>'+dateText+'</div></td>');
    }
    buf.push('</tr>');
  }
  buf.push('</tbody>');
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
    cacheData.monthNavSwiper.onResize();
    cacheData.monthViewSwiper.onResize();
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
  var _initMoreNavClass = function(s){
    var i = s.activeIndex;
    s.slides.each(function(k) {
      var $slide = $(this);
      if (k!=i-2) {
        $slide.removeClass('swiper-slide-prev-prev');
      } else {
        $slide.addClass('swiper-slide-prev-prev');
      }
      if (k!=i+2) {
        $slide.removeClass('swiper-slide-next-next');
      } else {
        $slide.addClass('swiper-slide-next-next');
      }
    });
  };
  cacheData.monthNavSwiper.on('init', _initMoreNavClass);
  cacheData.monthNavSwiper.on('setTranslate', _initMoreNavClass);
  cacheData.monthNavSwiper.on('transitionEnd', _initMoreNavClass);
  cacheData.monthNavSwiper.on('slideChangeEnd', _initMoreNavClass);
  _initMoreNavClass(cacheData.monthNavSwiper); // init it explicitly, onInit maybe not run
  var _monthNavChange = function(swiper){
    var i = swiper.activeIndex, m = getCurMonth();
    i -= monthNavNumMid;
    if (i==0) return;
    m = m + i;
    gotoMonth(m);
    swiper.slideTo(monthNavNumMid, false, true);
    clearSelectedDate();
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
    cacheData.yearViewSwiper.onResize();
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
  var isMoved = false;
  cacheData.yearViewSwiper.on("sliderMove", function(swiper){
    // console.log('sliderMove: '+swiper.translate);
    isMoved = true;
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
    if (!isMoved) {
      return;
    }
    isMoved = false;
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
var clearSelectedDate = function() {
  cacheData.selectedDate.set(null);
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
  cacheData.selectedDate = new ReactiveVar();
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
    return m;
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
  yearViewContentText: function() {
    var buf = [];
    for (var m=1; m<=12; m++) {
      buf.push('<div class="col-xs-4 col-sm-4 col-md-3 amonth" data-month="'+m+'">');
      buf.push(' <a>'+m+'月</a>');
      buf.push(' <table class="table">');
      appendMonthBodyText(buf, m);
      buf.push(' </table>');
      buf.push('</div>');
    }
    return buf.join('\n');
  },
  monthViewContentText: function() {
    var buf = [], m = getCurMonth();;
    buf.push('<table class="table">');
    buf.push('<thead><tr class="week-row">');
    var weekdays = getWeekdays();
    for (var i=0; i<weekdays.length; i++) {
      buf.push('<td>'+ScheduleTable.dayNumWords[weekdays[i]]+'</td>');
    }
    buf.push('</tr></thead>');
    appendMonthBodyText(buf, m);
    buf.push('</table>');
    return buf.join('\n');
  },
  courseList: function() {
    var date = cacheData.selectedDate.get();
    if (!date) return null;
    var items = ScheduleTable.findAttendancesByDate(Meteor.user(), date);
    if (!items) return null;
    _.each(items, function(obj){
      Meteor.subscribe("commentsByCourseAttendanceId", {'find':{'courseAttendanceId': obj._id}});
    });
    return items.sort(function(a,b){
      return a.attendTime - b.attendTime;
    });
  },
  getCourseStateStr: function(obj) {
    var state=obj.state, stateStr="", nowTime = cacheData.now.get().getTime();
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
    return stateStr;
  },
  isCommented: function(course) {
    return course.state == ScheduleTable.attendanceStateDict["commented"].value;
  },
  commentStars: function(course){
    var comment = Comments.findOne({'courseAttendanceId': course._id});
    if (!comment) {
      return null;
    }
    var maScore = comment.maScore;
    var laScore = comment.laScore;
    maScore = _.isNumber(maScore) ? maScore : 0;
    laScore = _.isNumber(laScore) ? laScore : 0;
    return genScoreStarsAry((maScore + laScore)/2, 5);
  }
});
Template.scheduleCalendar.events({
  'click .year-title': function(e) {
    var v = getViewType();
    if (v=='month') {
      Session.set('view', 'year');
      $('.year-view-box').show();
      $('.month-view-box').hide();
      subscribe(getCurYear());
      initYearViewSwiper();
      clearSelectedDate();
    }
  },
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
    clearSelectedDate();
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
    clearSelectedDate();
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
    clearSelectedDate();
  },
  'click .month-nav a': function(e) {
    var ele=e.target, $ele = $(ele), i = $ele.data('i'), m = getCurMonth();
    if (i==0) return;
    m = m + i;
    gotoMonth(m);
    clearSelectedDate();
  },
  'click .month-view td.date': function(e) {
    var ele=e.target, $ele = $(ele).closest('td');
    var m = getCurMonth(), row = $ele.data("row"), col = $ele.data("col");
    var date = getDateByTable(m, row, col);
    // alert(JSON.stringify(date));
    cacheData.selectedDate.set(date);
  }
});
