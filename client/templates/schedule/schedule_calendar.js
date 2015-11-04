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
var getWeekrowsCount = function(m, y) {
  if (!m) m = getCurMonth();
  if (!y) y = getCurYear();
  var indexFirstDay = getIndexFirstDay(y,m), maxDay = getMaxDay(y,m);
  var daysInFirstWeek = 7-indexFirstDay;
  return Math.ceil((maxDay-daysInFirstWeek)/7)+1;
}
var calcMonth = function(m, y, offset) {
  if (offset<0 && offset<=-12) {
    y += Math.ceil(offset/12);
  }
  if (offset>0 && offset>=12) {
    y += Math.floor(offset/12);
  }
  m+=offset%12;
  if (m<=0) {
    y-=1;
    m+=12;
  }
  if (m>=13) {
    y+=1;
    m-=12;
  }
  return {'y':y, 'm': m};
}
var calcPrevMonth = function(m, y) {
  if (!m) m = getCurMonth();
  if (!y) y = getCurYear();
  return calcMonth(m, y, -1);
}
var calcNextMonth = function(m, y) {
  if (!m) m = getCurMonth();
  if (!y) y = getCurYear();
  return calcMonth(m, y, 1);
}
var calcDateByTable = function(m, row, col, y) {
  if (!y) y = getCurYear();
  var indexFirstDay = getIndexFirstDay(y,m), maxDay = getMaxDay(y,m);
  var d = row*7+col-indexFirstDay+1;
  var flag = true; // is it in this month
  if (d<1) {
    flag = false;
    var prevMonth = calcPrevMonth(m,y);
    m = prevMonth.m;
    y = prevMonth.y;
    d = getMaxDay(y,m)+d;
  } else if (d>maxDay) {
    flag = false;
    d = col - getIndexLastDay(y,m);
    var nextMonth = calcNextMonth(m,y);
    m = nextMonth.m;
    y = nextMonth.y;
  }
  return {year:y, month:m, date:d, flag:flag};
}
var isToday = function(year, month, day) {
  var today = cacheData.today.get();
  return (today.getDate() == day && today.getMonth()+1 == month && today.getFullYear() == year);
}
var getCourseStateClass = function(year, month, day) {
  var items = ScheduleTable.findAttendancesByDate(Meteor.user(), year, month, day);
  if (items && items.length) {
    var nowTime = cacheData.now.get().getTime();
    var unfinished = _.some(items, function(obj){
      return obj.endTime>nowTime && obj.state==ScheduleTable.attendanceStateDict["reserved"].value;
    });
    if (unfinished) {
      return "todo";
    } else {
      return "done";
    }
  }
  return false;
}
var getTdDateClass = function(year, month, day) {
  var classStr = "", today = cacheData.today.get();
  if (isToday(year, month, day)) {
    classStr+=" today";
  }
  if (getViewType()==='month' && getCurMonth()!=month) {
    return classStr; // short return: don't show the courses info of not visible date
  }
  var state = getCourseStateClass(year, month, day);
  if (state) {
    classStr += state;
  }
  return classStr;
}
// html render functions
var appendMonthBodyText = function(buf, m, y, isMonthView) {
  buf.push('<tbody>');
  var rows = getWeekrowsCount(m, y), _height = 276/rows;
  for (var r=0; r<rows; r++) {
    if (isMonthView) {
      buf.push('<tr style="height:'+_height+'px">');
    } else {
      buf.push('<tr>');
    }
    for (var i=0; i<7; i++) {
      var tdDateClass = '', dateText = '';
      var date = calcDateByTable(m, r, i, y);
      if (date && date.flag) {
        if (isToday(date.year, date.month, date.date)) {
          tdDateClass = 'today';
        }
        dateText = date.date;
      }
      buf.push('<td class="date '+tdDateClass+'" row="'+r+'" col="'+i+'"><div>'+dateText+'</div></td>');
    }
    buf.push('</tr>');
  }
  buf.push('</tbody>');
}
var generateYearViewContent = function(y) {
  if (!y) y = getCurYear();
  var buf = [];
  buf.push('<div class="year-view-con" year="'+y+'">');
  buf.push('<div class="schedule-calendar-header">');
  buf.push('  <div class="inner">');
  buf.push('    <a class="year-title">'+y+'年</a>');
  buf.push('    <div class="pull-right marks">');
  buf.push('      <div class="todo"><span class="ion-record"></span>待上课</div>');
  buf.push('      <div class="done"><span class="ion-record"></span>已上课</div>');
  buf.push('    </div>');
  buf.push('  </div>');
  buf.push('</div>');
  buf.push('<div class="clearfix year-view">');
  for (var m=1; m<=12; m++) {
    buf.push('<div class="col-xs-4 col-sm-4 col-md-3 amonth" month="'+m+'">');
    buf.push(' <a>'+m+'月</a>');
    buf.push(' <table class="table">');
    appendMonthBodyText(buf, m, y);
    buf.push(' </table>');
    buf.push('</div>');
  }
  buf.push('</div>');
  buf.push('</div>');
  return buf.join('\n');
}
var generateMonthViewContent = function(m, y) {
  if (!m) m = getCurMonth();
  if (!y) y = getCurYear();
  var buf = [];
  buf.push('<table class="table" year="'+y+'" month="'+m+'">');
  buf.push('<thead><tr class="week-row">');
  var weekdays = getWeekdays();
  for (var i=0; i<weekdays.length; i++) {
    buf.push('<td>'+ScheduleTable.dayNumWords[weekdays[i]]+'</td>');
  }
  buf.push('</tr></thead>');
  appendMonthBodyText(buf, m, y, true);
  buf.push('</table>');
  return buf.join('\n');
}
// subscribe course-attendances data from server
var subscribe = function(year, month, callback) {
  if (_.isFunction(month)) {
    callback = month;
    month = null;
  }
  console.log("subscribe: "+year+"-"+month);
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
  Session.set("calendarShowLoading", true);
  Meteor.subscribe('courseAttendances', param, function(){
    console.log("subscribe end");
    if (callback) {
      callback();
    }
    Session.set("calendarShowLoading", false);
    timerDep.changed();
  });
}
// data for month nav bar
var monthNavNumMid = 10;
var monthNavNumCount = 2*monthNavNumMid + 1;
// fn for month-nav swiper
var getMonthIndexInMonthNav = function(m, y) {
  var idx = -1;
  cacheData.monthNavSwiper.slides.each(function(i){
    var $slide = $(this), $ele = $slide.children().first();
    if ($ele.attr('year')==y && $ele.attr('month')==m) {
      idx = i;
      return false;
    }
  });
  return idx;
}
var reInitMonthNavSwiper = function() {
  cacheData.monthNavSwiper.removeAllSlides();
  var m = getCurMonth(), y = getCurYear(), a = [];
  for (var i=0; i<monthNavNumCount; i++) {
    var tmpMonth = calcMonth(m, y, i-monthNavNumMid);
    var slideHtml = ('<div class="swiper-slide">');
    slideHtml += ('  <a month="'+tmpMonth.m+'" year="'+tmpMonth.y+'">'+tmpMonth.m+'<span class="unit">月</span></a>');
    slideHtml += ('</div>');
    a.push(slideHtml);
  }
  cacheData.monthNavSwiper.appendSlide(a);
  cacheData.monthNavSwiper.slideTo(monthNavNumMid, 500, true);
}
var setMonthInMonthNav = function(m, y){
  var monthNavIndex = getMonthIndexInMonthNav(m, y);
  // console.log('monthNavIndex: ' + monthNavIndex);
  if (monthNavIndex>=0) {
    cacheData.monthNavSwiper.slideTo(monthNavIndex, 500, false);
    _monthNavChange(cacheData.monthNavSwiper);
  } else {
    reInitMonthNavSwiper();
  }
}
// fn for month-view swiper
var getMonthIndexInMonthView = function(m, y) {
  var idx = -1;
  cacheData.monthViewSwiper.slides.each(function(i){
    var $slide = $(this), $ele = $slide.children().first();
    if ($ele.attr('year')==y && $ele.attr('month')==m) {
      idx = i;
      return false;
    }
  });
  return idx;
}
var reInitMonthViewSwiper = function() {
  cacheData.monthViewSwiper.removeAllSlides();
  var m = getCurMonth(), y = getCurYear();
  var prevMonth = calcPrevMonth(m, y), nextMonth = calcNextMonth(m, y);
  var a = [
    '<div class="swiper-slide">'+generateMonthViewContent(prevMonth.m, prevMonth.y)+'</div>',
    '<div class="swiper-slide">'+generateMonthViewContent(m, y)+'</div>',
    '<div class="swiper-slide">'+generateMonthViewContent(nextMonth.m, nextMonth.y)+'</div>'
  ];
  cacheData.monthViewSwiper.appendSlide(a);
  cacheData.monthViewSwiper.slideTo(1, 500, true);
}
var setMonthInMonthView = function(m, y){
  var monthViewIndex = getMonthIndexInMonthView(m, y);
  // console.log('monthViewIndex: ' + monthViewIndex);
  if (monthViewIndex>=0) {
    cacheData.monthViewSwiper.slideTo(monthViewIndex, 500, false);
    _monthViewChange(cacheData.monthViewSwiper);
  } else {
    reInitMonthViewSwiper();
  }
}
// month swipers event handlers
var _monthNavMoveEnd = function(swiper){
  swiper.slides.each(function(){
    $(this).children('a').removeClass('moving');
  });
};
var _monthNavChange = function(swiper){
  _monthNavMoveEnd(swiper);
  var idx = swiper.activeIndex;
  console.log("month-nav transitionEnd: "+idx+", "+swiper.slides.length);
  var $slide = $(swiper.slides[idx]), $monthEle = $slide.children().first();
  var y = parseInt($monthEle.attr('year')), m = parseInt($monthEle.attr('month'));
  if (idx<=7) {
    var $firstEle = $(swiper.slides[0]).children().first();
    var a=[], _y = parseInt($firstEle.attr('year')), _m = parseInt($firstEle.attr('month'));
    for (var j=0;j<7;j++) {
      var tmpMonth = calcMonth(_m, _y, j-7);
      a.push('<div class="swiper-slide"><a month="'+tmpMonth.m+'" year="'+tmpMonth.y+'">'+tmpMonth.m+'<span class="unit">月</span></a></div>');
    }
    swiper.prependSlide(a);
  }
  if (idx>=swiper.slides.length-7) {
    var $lastEle = $(swiper.slides[swiper.slides.length-1]).children().first();
    var a=[], _y = parseInt($lastEle.attr('year')), _m = parseInt($lastEle.attr('month'));
    for (var j=1;j<=7;j++) {
      var tmpMonth = calcMonth(_m, _y, j);
      a.push('<div class="swiper-slide"><a month="'+tmpMonth.m+'" year="'+tmpMonth.y+'">'+tmpMonth.m+'<span class="unit">月</span></a></div>');
    }
    swiper.appendSlide(a);
  }
  if (y==getCurYear() && m==getCurMonth()) {
    return;
  }
  Session.set('month', m);
  Session.set('year', y);
  setMonthInMonthView(m, y);
  subscribe(y, m);
  clearSelectedDate();
};
var _monthViewChange = function(swiper){
  var idx = swiper.activeIndex;
  console.log("month transitionEnd: "+idx+", "+swiper.slides.length);
  var $slide = $(swiper.slides[idx]), $monthTable = $slide.children().first();
  var y = parseInt($monthTable.attr('year')), m = parseInt($monthTable.attr('month'));
  if (idx===swiper.slides.length-1) {
    var nextMonth = calcNextMonth(m, y);
    var newSlidehtml = '<div class="swiper-slide">'+generateMonthViewContent(nextMonth.m, nextMonth.y)+'</div>';
    swiper.appendSlide(newSlidehtml);
  }
  if (idx===0) {
    var prevMonth = calcPrevMonth(m, y);
    var newSlidehtml = '<div class="swiper-slide">'+generateMonthViewContent(prevMonth.m, prevMonth.y)+'</div>';
    swiper.prependSlide(newSlidehtml);
  }
  if (y==getCurYear() && m==getCurMonth()) {
    return;
  }
  Session.set('month', m);
  Session.set('year', y);
  setMonthInMonthNav(m, y);
  subscribe(y, m);
  clearSelectedDate();
};
var initMonthViewSwiper = function() {
  if (cacheData.monthViewSwiper) {
    // cacheData.monthNavSwiper.onResize();
    // cacheData.monthViewSwiper.onResize();
    setMonthInMonthNav(getCurMonth(), getCurYear());
    setMonthInMonthView(getCurMonth(), getCurYear());
    return;
  }
  // 月导航条
  var $monthNavContainer = $('#monthNav > .swiper-container'),
      $monthNavWrapper = $monthNavContainer.children().first();
  var m = getCurMonth(), y = getCurYear(), buf = [];
  for (var i=0; i<monthNavNumCount; i++) {
    var tmpMonth = calcMonth(m, y, i-monthNavNumMid);
    buf.push('<div class="swiper-slide">');
    buf.push('  <a month="'+tmpMonth.m+'" year="'+tmpMonth.y+'">'+tmpMonth.m+'<span class="unit">月</span></a>');
    buf.push('</div>');
  }
  $monthNavWrapper.append(buf.join('\n'));
  cacheData.monthNavSwiper = new Swiper($monthNavContainer, {
    initialSlide: monthNavNumMid,
    slidesPerView: 7,
    freeMode: true,
    freeModeMomentum: true,
    freeModeMomentumRatio: 0.2,
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
  cacheData.monthNavSwiper.on("slideChangeEnd", _monthNavChange);// slideChangeEnd not works well
  cacheData.monthNavSwiper.on("transitionEnd", _monthNavChange);
  cacheData.monthNavSwiper.on('setTranslate', function(swiper){
    if (!swiper.slides || !swiper.slides.length) {
      return;
    }
    var $mask = $('#monthNav > .month-nav-mask'), $curA = swiper.wrapper.children('.swiper-slide-active').children().first();
    var maskLeft = $mask.offset().left, curALeft = $curA.offset().left;
    // console.log("moving: "+curALeft);
    if (maskLeft>curALeft+15 || maskLeft+20<curALeft) {
      $curA.addClass('moving');
    }
  });
  // 月历表
  var $monthViewContainer = $('#monthView > .swiper-container'),
      $monthViewWrapper = $monthViewContainer.children().first();
  var m = getCurMonth(), y = getCurYear(), prevMonth = calcPrevMonth(m, y), nextMonth = calcNextMonth(m, y);
  $monthViewWrapper.children().eq(0).html(generateMonthViewContent(prevMonth.m, prevMonth.y));
  $monthViewWrapper.children().eq(1).html(generateMonthViewContent(m, y));
  $monthViewWrapper.children().eq(2).html(generateMonthViewContent(nextMonth.m, nextMonth.y));
  cacheData.monthViewSwiper = new Swiper($monthViewContainer, {
    initialSlide: 1
  });
  cacheData.monthViewSwiper.on("slideChangeEnd", _monthViewChange);
  cacheData.monthViewSwiper.on("transitionEnd", _monthViewChange);
}
// fn for year swiper
var getYearIndexInYearView = function(y) {
  var idx = -1;
  cacheData.yearViewSwiper.slides.each(function(i){
    var $slide = $(this), $ele = $slide.children().first();
    if (parseInt($ele.attr('year'))==y) {
      idx = i;
      return false;
    }
  });
  return idx;
}
var reInitYearViewSwiper = function() {
  cacheData.yearViewSwiper.removeAllSlides();
  var y = getCurYear();
  var a = [
    '<div class="swiper-slide">'+generateYearViewContent(y-1)+'</div>',
    '<div class="swiper-slide">'+generateYearViewContent(y)+'</div>',
    '<div class="swiper-slide">'+generateYearViewContent(y+1)+'</div>'
  ];
  cacheData.yearViewSwiper.appendSlide(a);
  cacheData.yearViewSwiper.slideTo(1, 500, true);
}
var setYearInYearView = function(y){
  var yearViewIndex = getYearIndexInYearView(y);
  if (yearViewIndex>=0) {
    cacheData.yearViewSwiper.slideTo(yearViewIndex, 500, false);
    _yearViewChange(cacheData.yearViewSwiper);
  } else {
    reInitYearViewSwiper();
  }
}
var _yearViewChange = function(swiper){
  console.log("year transitionEnd: "+swiper.activeIndex+", "+swiper.slides.length);
  var y = parseInt($(swiper.slides[swiper.activeIndex]).children().first().attr('year'));
  if (swiper.activeIndex===swiper.slides.length-1) {
    var newSlidehtml = '<div class="swiper-slide">'+generateYearViewContent(y+1)+'</div>';
    swiper.appendSlide(newSlidehtml);
  }
  if (swiper.activeIndex===0) {
    var oldTranslate = swiper.translate;
    var newSlidehtml = '<div class="swiper-slide">'+generateYearViewContent(y-1)+'</div>';
    swiper.wrapper.prepend(newSlidehtml);
    swiper.update();
    var newTranslate = oldTranslate - $(swiper.slides[0]).height();
    swiper.setWrapperTranslate(newTranslate);
  }
  if (y==getCurYear()) {
    return;
  }
  Session.set('year', y);
  subscribe(y);
};
var initYearViewSwiper = function() {
  if (cacheData.yearViewSwiper) {
    // cacheData.yearViewSwiper.onResize();
    setYearInYearView(getCurYear());
    return;
  }
  var $yearViewContainer = $('#yearViewBox > .swiper-container'),
      $yearViewWrapper = $yearViewContainer.children().first();
  var y = getCurYear();
  $yearViewWrapper.children().eq(0).html(generateYearViewContent(y-1));
  $yearViewWrapper.children().eq(1).html(generateYearViewContent(y));
  $yearViewWrapper.children().eq(2).html(generateYearViewContent(y+1));
  cacheData.yearViewSwiper = new Swiper($yearViewContainer, {
    direction: 'vertical',
    slidesPerView: 1,
    initialSlide: 1,
    freeMode: true,
    freeModeMomentum: true,
    freeModeMomentumRatio: 0.3,
    freeModeMomentumBounce: true,
    freeModeMomentumBounceRatio: 1,
    freeModeSticky: false
  });
  var _reviseSlidesHeight = function(swiper) {
    var $calendar = $(".content.schedule-calendar");
    var wrapperHeight = $calendar.height();
    swiper.slides.each(function(){
      var $slide = $(this), yearConHeight = $slide.children().first().height();
      $slide.height(yearConHeight);
      wrapperHeight = Math.max(wrapperHeight, yearConHeight);
    });
    swiper.wrapper.height(wrapperHeight);
    swiper.onResize();
  }
  _reviseSlidesHeight(cacheData.yearViewSwiper);
  cacheData.yearViewSwiper.slideTo(1, false, true);
  cacheData.yearViewSwiper.on('init', _reviseSlidesHeight);
  // cacheData.yearViewSwiper.on("slideChangeEnd", _yearViewChange);
  cacheData.yearViewSwiper.on("transitionEnd", _yearViewChange);
}
// update calendar data functions
var timerDep = new Tracker.Dependency;
var _updateMonthBodyClass = function($table, y, m) {
  $table.children('tbody').children().each(function(){//<tr>
    $(this).children().each(function(){//<td>
      var d = this.children[0].innerText;
      if (!d) return;
      var newClassName = 'date ';
      if (isToday(y, m, d)) {
        newClassName += 'today ';
      }
      var state = getCourseStateClass(y, m, d);
      if (state) {
        newClassName += state;
      }
      // if (this.className==newClassName){
      //   return;
      // }
      this.className = newClassName;
    });
  });
}
var timerDepHandler = function() {
  timerDep.depend();
  console.log('timerDepHandler()');
  var startTime = new Date().getTime();
  var viewType = getViewType();
  if (viewType==='month') {
    var mSwiper = cacheData.monthViewSwiper;
    if (!mSwiper || !mSwiper.slides || !mSwiper.slides.length) {
      return;
    }
    var $table = $(mSwiper.slides[mSwiper.activeIndex]).children().first();
    var y = parseInt($table.attr('year')), m = parseInt($table.attr('month'));
    _updateMonthBodyClass($table, y, m);
  } else {
    var ySwiper = cacheData.yearViewSwiper;
    if (!ySwiper || !ySwiper.slides || !ySwiper.slides.length) {
      return;
    }
    var $yearViewCon = $(ySwiper.slides[ySwiper.activeIndex]).children().first();
    var y = parseInt($yearViewCon.attr('year'));
    $yearViewCon.children('.year-view').children().each(function(){
      var $amonth = $(this), $table = $amonth.children('table');
      var m = parseInt($amonth.attr('month'));
      _updateMonthBodyClass($table, y, m);
    });
  }
  console.log("" + (new Date().getTime()-startTime));
}
Tracker.autorun(function() {
  timerDepHandler();
});
// course item list date
var clearSelectedDate = function() {
  cacheData.selectedDate.set(null);
}
// the template
var resetCacheData = function() {
  Meteor.clearInterval(cacheData.nowInterval); // must do
  if (cacheData.yearViewSwiper) {
    cacheData.yearViewSwiper.destroy();
    cacheData.yearViewSwiper = null;
  }
  if (cacheData.monthNavSwiper) {
    cacheData.monthNavSwiper.destroy();
    cacheData.monthNavSwiper = null;
  }
  if (cacheData.monthViewSwiper) {
    cacheData.monthViewSwiper.destroy();
    cacheData.monthViewSwiper = null;
  }
  // cacheData = {};
}
Template.scheduleCalendar.onCreated(function(){
  resetCacheData();
  var _now = new Date();
  cacheData.today = new ReactiveVar(_now, function(a,b){
    return (a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate())
  });
  cacheData.now = new ReactiveVar(_now);
  cacheData.nowInterval = Meteor.setInterval(function () {
    var _tmp = new Date();
    cacheData.now.set(_tmp);
    cacheData.today.set(_tmp);
    timerDep.changed();
  }, 60000);
  cacheData.selectedDate = new ReactiveVar();
  Session.set('view', 'month');
  Session.set('year', _now.getFullYear());
  Session.set('month', _now.getMonth()+1);
});
Template.scheduleCalendar.onDestroyed(function(){
  resetCacheData();
});
Template.scheduleCalendar.onRendered(function(){
  var v = getViewType();
  if (v=='month') {
    $("#yearViewBox").hide();
    $("#monthViewBox").show();
    initMonthViewSwiper();
    subscribe(getCurYear(),getCurMonth());
  } else {
    $("#monthViewBox").hide();
    $("#yearViewBox").show();
    initYearViewSwiper();
    subscribe(getCurYear());
  }
});
Template.scheduleCalendar.helpers({
  showLoading: function(){
    return Session.get("calendarShowLoading");
  },
  year: function() {
    return getCurYear();
  },
  isShowToToday: function() {
    var v = getViewType();
    if (v!='month') {
      return true;
    }
    var today = cacheData.today.get(), y = today.getFullYear(), m = today.getMonth()+1;
    return y != getCurYear() || m != getCurMonth();
  },
  isMonthView: function() {
    return getViewType()==='month';
  },
  canChangeView: function() {
    var v = getViewType();
    if (v!='month') {
      return false;
    }
    return true;
  },
  changeViewBtnText: function() {
    var v = getViewType();
    if (v=='month') {
      return "按年";
    }
    return '按月';
  },
  courseList: function() {
    var date = cacheData.selectedDate.get();
    if (!date) return null;
    var items = ScheduleTable.findAttendancesByDate(Meteor.user(), date.year, date.month, date.date);
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
var _gotoMonth = function(y, m) {
  Session.set('year', y);
  Session.set('month', m);
  initMonthViewSwiper();
  subscribe(y,m);
  clearSelectedDate();
}
Template.scheduleCalendar.events({
  'click .year-title': function(e) {
    var v = getViewType();
    if (v=='month') {
      Session.set('view', 'year');
      $('#yearViewBox').show();
      $('#monthViewBox').hide();
      initYearViewSwiper();
      subscribe(getCurYear());
      clearSelectedDate();
    }
  },
  'click .btn-go-today': function(e) {
    var v = getViewType(), today = new Date(), y = today.getFullYear(), m = today.getMonth()+1;
    if (v!=='month') {
      Session.set('view', 'month');
      $('#yearViewBox').hide();
      $('#monthViewBox').show();
    }
    _gotoMonth(y, m);
  },
  'click .btn-change-view': function(e) {
    console.log("change-view");
    var v = getViewType();
    if (v=='month') {
      Session.set('view', 'year');
      $('#yearViewBox').show();
      $('#monthViewBox').hide();
      initYearViewSwiper();
      subscribe(getCurYear());
    } else {
      Session.set('view', 'month');
      $('#yearViewBox').hide();
      $('#monthViewBox').show();
      initMonthViewSwiper();
      subscribe(getCurYear(),getCurMonth());
    }
    clearSelectedDate();
  },
  'click .amonth': function(e) {
    var ele=e.target, $ele = $(ele).closest('.amonth'), $yearCon = $ele.closest('.year-view-con');
    var m = parseInt($ele.attr('month')), y = parseInt($yearCon.attr('year'));
    Session.set('view', 'month');
    $('#yearViewBox').hide();
    $('#monthViewBox').show();
    _gotoMonth(y, m);
  },
  'click .month-nav a': function(e) {
    var ele=e.target, $ele = $(ele), y = parseInt($ele.attr('year')), m = parseInt($ele.attr('month'));
    _gotoMonth(y, m);
  },
  'click .month-view td.date': function(e) {
    var ele=e.target, $ele = $(ele).closest('td'), day = $ele.text();
    if (!day) return;
    var date = {'year': getCurYear(), 'month': getCurMonth(), 'date': day};
    cacheData.selectedDate.set(date);
  }
});
