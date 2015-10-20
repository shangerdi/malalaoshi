var _getTeachingAgeList = function() {
  var a=[];
  for (i=1;i<=20;i++) {
    a.push({'key': i, 'text': i+'年'});
  }
  a.push({'key': '20+', 'text': '20年以上'});
  return a;
}
Template._teachingAgeActionSheet.onRendered(function(){
  // create swiper
  var swiperOption = {
    slidesPerView: 5,
    freeMode: true,
    freeModeMomentum: true,
    freeModeMomentumRatio: 0.3,
    freeModeMomentumBounce: true,
    freeModeMomentumBounceRatio: 0.01,
    freeModeSticky: true,
    centeredSlides: true,
    direction: 'vertical'
  };
  this.degreeSwiper = new Swiper('.swiper-container.degree-swiper', swiperOption);

  var _swiperChange = function(swiper){
    var degree = $(swiper.slides[swiper.activeIndex]).data('value');
    Session.set("curSwiperTeachingAge", ""+degree);
  }
  // NOTE: if only use "slideChangeEnd" event, it doesn't work well
  this.degreeSwiper.on("slideChangeEnd", _swiperChange);
  this.degreeSwiper.on("transitionEnd", _swiperChange);
  Session.set("curSwiperTeachingAge", ""+_getTeachingAgeList()[0].key);
});
Template._teachingAgeActionSheet.helpers({
  teachingAgeList: function() {
    return _getTeachingAgeList();
  }
});
