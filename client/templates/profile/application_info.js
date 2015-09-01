Template.applicationInfo.onRendered(function(){
  this.teachYearsSwiper = new Swiper('.swiper-container', {
    slidesPerView: 'auto',
    centeredSlides: true
  });
});
Template.applicationInfo.helpers({
  teachYearNums: function() {
    var a=[];
    for (i=1;i<=20;i++) {
      a.push(i);
    }
    return a;
  }
});
Template.applicationInfo.events({
  'click #submitInfo': function() {
    // TODO 提交申请资料
    console.log('submitInfo');
  }
});
