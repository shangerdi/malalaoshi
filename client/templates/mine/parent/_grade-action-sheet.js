var _getGradeList = function() {
  var dict = getEduGradeDict();
  var a = [];
  _.each(dict, function(obj){
    a.push({key:obj.key, text:obj.text});
  });
  return a;
}
Template._gradeActionSheet.onRendered(function(){
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
  this.gradeSwiper = new Swiper('.swiper-container.grade-swiper', swiperOption);

  var _swiperChange = function(swiper){
    var grade = $(swiper.slides[swiper.activeIndex]).data('value');
    Session.set("curSwiperGrade", grade);
  }
  // NOTE: if only use "slideChangeEnd" event, it doesn't work well
  this.gradeSwiper.on("slideChangeEnd", _swiperChange);
  this.gradeSwiper.on("transitionEnd", _swiperChange);
  Session.set("curSwiperGrade", _getGradeList()[0].key);
});
Template._gradeActionSheet.helpers({
  gradeList: function() {
    return _getGradeList();
  }
});
