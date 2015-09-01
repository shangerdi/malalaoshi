Template.applicationInfo.onRendered(function(){
  $('.ion-slide-box').slick('setOption','variableWidth',true,true);
});
Template.applicationInfo.helpers({

});
Template.applicationInfo.events({
  'click #submitInfo': function() {
    // TODO 提交申请资料
    console.log('submitInfo');
  }
});
