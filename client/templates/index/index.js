Template.index.onCreated(function(){
  Session.set('hasTabsTop',false);
  appSetDefaultCity();
});

Template.index.onRendered(function () {
  this.data = this.data || {};
  this.data.swiperObj = new Swiper('.index-swiper', {
    pagination: '.swiper-pagination',
    paginationClickable: true
  });
});
Template.index.helpers({
  show: function(){
    return [
      {
        imgSrc: "https://s3-ap-southeast-1.amazonaws.com/my.images.head/test_1234/1438334988731.png",
        id: "HWQLWZ59GxtrdEoz3",
        title: "如何成为麻辣老师",
        thisPath: 'introduce'
      },
      {
        imgSrc: "https://s3-ap-southeast-1.amazonaws.com/my.images.head/12323232323/1437113067545.jpg",
        id: "uCMX3NyPbpzvgNJn5",
        title: "关于麻辣老师",
        thisPath: 'introduce'
      },
      {
        imgSrc: "https://s3-ap-southeast-1.amazonaws.com/my.images.head/12222222229/1437104183029.jpg",
        id: "9eAWCyRHZ92gAQjzX",
        title: "成果展示",
        thisPath: 'introduce'
      }
    ];
  },
  recommendedTeachers: function(){
    return [
      {
        imgSrc: "https://s3-ap-southeast-1.amazonaws.com/my.images.head/test_1234/1438334988731.png",
        id: "HWQLWZ59GxtrdEoz3"
      },
      {
        imgSrc: "https://s3-ap-southeast-1.amazonaws.com/my.images.head/12323232323/1437113067545.jpg",
        id: "uCMX3NyPbpzvgNJn5"
      }
    ];
  }
});

Template.index.events({
  'submit form': function(e){
  }
});
