var _getDegreeList = function() {
  var a = getEduDegreeList();
  return a.reverse();
}
Template._degreeActionSheet.onRendered(function(){
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
    Session.set("curSwiperDegree", degree);
  }
  // NOTE: if only use "slideChangeEnd" event, it doesn't work well
  this.degreeSwiper.on("slideChangeEnd", _swiperChange);
  this.degreeSwiper.on("transitionEnd", _swiperChange);
  Session.set("curSwiperDegree", _getDegreeList()[0].key);
});
Template._degreeActionSheet.helpers({
  degreeList: function() {
    return _getDegreeList();
  }
});
