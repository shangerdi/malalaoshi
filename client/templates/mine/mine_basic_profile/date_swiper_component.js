var dateSwipers = null
// at one swiper: get index of slide ref to certain value
var _getSlideIndex = function(swiper, value) {
  if (!value) {
    return -1;
  }
  var index = 0, ok = false;
  swiper.slides.each(function(){
    var val = $(this).data('value');
    if (val==value) {
      ok = true;
      return false;// end loop
    }
    index++;
  });
  if (ok) {
    return index;
  }
  return -1;
}
var getDayList = function(year, month) {
  var maxDay = 31;
  if (year && month) {
    maxDay = moment([year,month-1]).endOf('month').date();
  }
  var a = [];
  for (var i = maxDay; i >= 1; i--) {
    a.push({'key':i, 'text': i + "日"});
  }
  return a;
}
// when month or year change, update day swiper slides
var _upadteDaySwiperSlides = function() {
  var year = Session.get("curSwiperYear"), month = Session.get("curSwiperMonth");
  var a = getDayList(year, month);
  if (!a || !a.length) {
    return;
  }

  var daySwiper = dateSwipers.daySwiper;
  if (daySwiper && daySwiper.slides && daySwiper.slides.length && daySwiper.slides.length!=a.length) {
    // 因为日期是逆序排列，需要修正天数选择
    var slidesHtml = [];
    _.each(a, function(obj){
      slidesHtml.push('<div class="swiper-slide" data-value="'+obj.key+'">'+obj.text+'</div>');
    });
    daySwiper.removeAllSlides(); //移除全部
    daySwiper.appendSlide(slidesHtml);
    var dayIndex = _getSlideIndex(daySwiper, Session.get("curSwiperDay"));
    daySwiper.slideTo(dayIndex, 0, null);
  }
}

Template.dateSwiperComponent.onRendered(function(){
  // create swiper
  var n = 5;
  this.yearSwiper = new Swiper('.swiper-container.year-swiper', {
    slidesPerView: n,
    freeMode: true,
    freeModeMomentum: true,
    freeModeMomentumRatio: 0.3,
    freeModeMomentumBounce: true,
    freeModeMomentumBounceRatio: 0.01,
    freeModeSticky: true,
    centeredSlides: true,
    direction: 'vertical'
  });
  this.monthSwiper = new Swiper('.swiper-container.month-swiper', {
    slidesPerView: n,
    freeMode: true,
    freeModeMomentum: true,
    freeModeMomentumRatio: 0.3,
    freeModeMomentumBounce: true,
    freeModeMomentumBounceRatio: 0.01,
    freeModeSticky: true,
    centeredSlides: true,
    direction: 'vertical'
  });
  this.daySwiper = new Swiper('.swiper-container.day-swiper', {
    slidesPerView: n,
    freeMode: true,
    freeModeMomentum: true,
    freeModeMomentumRatio: 0.3,
    freeModeMomentumBounce: true,
    freeModeMomentumBounceRatio: 0.01,
    freeModeSticky: true,
    centeredSlides: true,
    direction: 'vertical'
  });
  dateSwipers = this;
  var _yearSwiperChange = function(swiper){
    var year = $(swiper.slides[swiper.activeIndex]).data('value');
    Session.set("curSwiperYear", year);
    _upadteDaySwiperSlides();
  }
  // NOTE: if only use "slideChangeEnd" event, it doesn't work well
  this.yearSwiper.on("slideChangeEnd", _yearSwiperChange);
  this.yearSwiper.on("transitionEnd", _yearSwiperChange);
  var _monthSwiperChange = function(swiper) {
    var month = $(swiper.slides[swiper.activeIndex]).data('value');
    Session.set("curSwiperMonth", month);
    _upadteDaySwiperSlides();
  }
  this.monthSwiper.on("slideChangeEnd", _monthSwiperChange);
  this.monthSwiper.on("transitionEnd", _monthSwiperChange);
  var _daySwiperChange = function(swiper) {
    var day = $(swiper.slides[swiper.activeIndex]).data('value');
    Session.set("curSwiperDay", day);
  }
  this.daySwiper.on("slideChangeEnd", _daySwiperChange);
  this.daySwiper.on("transitionEnd", _daySwiperChange);
  // init old value
  var year = Session.get("curSwiperYear");
  var month = Session.get("curSwiperMonth");
  var day = Session.get("curSwiperDay");
  var yearIndex = _getSlideIndex(this.yearSwiper, year);
  if (yearIndex==-1) {
    year = new Date().getFullYear();
    Session.set("curSwiperYear", year);
  } else {
    this.yearSwiper.slideTo(yearIndex, 0, null);
  }
  var monthIndex = _getSlideIndex(this.monthSwiper, month);
  if (monthIndex==-1) {
    month = 12;
    Session.set("curSwiperMonth", month);
  } else {
    this.monthSwiper.slideTo(monthIndex, 0, null);
  }
  var dayIndex = _getSlideIndex(this.daySwiper, day);
  if (dayIndex==-1) {
    day = getDayList(year, month)[0].key;
    Session.set("curSwiperDay", day);
  } else {
    this.daySwiper.slideTo(dayIndex, 0, null);
  }
  _upadteDaySwiperSlides();
});
Template.dateSwiperComponent.helpers({
  yearList: function() {
    var a = [], curYear = new Date().getFullYear();
    for (var i = curYear; i >= 1900; i--) {
      a.push({'key':i, 'text': i + "年"});
    }
    return a;
  },
  monthList: function() {
    var a = [];
    for (var i = 12; i >= 1; i--) {
      a.push({'key':i, 'text': i + "月"});
    }
    return a;
  },
  dayList: function() {
    return getDayList();
  }
});
