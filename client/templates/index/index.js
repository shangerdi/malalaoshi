Template.index.onCreated(function(){
  Session.set('hasTabsTop',false);
  appSetDefaultCity();
});

Template.index.onRendered(function () {
  this.data = this.data || {};
  this.data.swiperObj = new Swiper('.index-swiper', {
    pagination: '.swiper-pagination',
    loop: true,
    paginationClickable: true
  });
});
Template.index.helpers({
  show: function(){
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
  },
  isTeacher: function(){
    var u = Meteor.user();
    return u && u.role == 'teacher';
  },
  show_teacher: function(){
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
