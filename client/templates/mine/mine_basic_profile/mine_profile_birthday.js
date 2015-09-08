var birthdaySwiper = null;
var saveProfileBirthday = function(e) {
  var yearSwiper = birthdaySwiper.yearSwiper, monthSwiper = birthdaySwiper.monthSwiper, daySwiper = birthdaySwiper.daySwiper;
  var year = $(yearSwiper.slides[yearSwiper.activeIndex]).data('value');
  var month = $(monthSwiper.slides[monthSwiper.activeIndex]).data('value');
  var day = $(daySwiper.slides[daySwiper.activeIndex]).data('value');
  var momentObj = moment([year, month-1, day]);
  if (!momentObj.isValid() || !momentObj.isBefore(moment(new Date()))) {
    alert("选择出错，请重新选择");
    return;
  }
  var birthday = year+'-'+month+'-'+day;
  if (birthday!==Meteor.user().profile.birthday) {
    Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.birthday':birthday}});
  }
  if (Meteor.isCordova) {
    navigator.app && navigator.app.backHistory && navigator.app.backHistory();
  } else {
    history.back();
  }
}
// at one swiper: get index of slide ref to certain value
var _getSlideIndex = function(swiper, value) {
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
Template.mineProfileBirthday.onCreated(function(){
  var birthday = Meteor.user().profile.birthday;
  if (birthday) {
    var a = birthday.split('-'), year = a[0], month = a[1];
    Session.set("curSwiperYear", year);
    Session.set("curSwiperMonth", month);
  }
});
Template.mineProfileBirthday.onRendered(function(){
  $("[data-action=save-profile-birthday]").click(saveProfileBirthday);
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
  birthdaySwiper = this;
  this.yearSwiper.on("slideChangeEnd", function(swiper){
    var year = $(swiper.slides[swiper.activeIndex]).data('value');
    Session.set("curSwiperYear", year);
  });
  this.monthSwiper.on("slideChangeEnd", function(swiper){
    var month = $(swiper.slides[swiper.activeIndex]).data('value');
    Session.set("curSwiperMonth", month);
  });
  // init old value
  var birthday = Meteor.user().profile.birthday;
  if (birthday) {
    var a = birthday.split('-'), year = a[0], month = a[1], day = a[2];
    var yearIndex = _getSlideIndex(this.yearSwiper, year);
    this.yearSwiper.slideTo(yearIndex, 0, null);
    var monthIndex = _getSlideIndex(this.monthSwiper, month);
    this.monthSwiper.slideTo(monthIndex, 0, null);
    var dayIndex = _getSlideIndex(this.daySwiper, day);
    this.daySwiper.slideTo(dayIndex, 0, null);
  }
});
Template.mineProfileBirthday.helpers({
  yearList: function() {
    var a = [], curYear = new Date().getFullYear();
    for (var i = curYear; i >= 1950; i--) {
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
    var maxDay = 31;
    var year = Session.get("curSwiperYear"), month = Session.get("curSwiperMonth");
    if (year && month) {
      maxDay = moment([year,month-1]).endOf('month').date();
    }
    var a = [];
    for (var i = maxDay; i >= 1; i--) {
      a.push({'key':i, 'text': i + "日"});
    }
    return a;
  }
});