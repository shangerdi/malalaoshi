var canRaffle = true;
Template.raffle.onCreated(function(){
  this.newRaffleValue = new ReactiveVar();
});
Template.raffle.events({
  'click .raffle-view > div > div': function(e){
    e.preventDefault();
    if(canRaffle){
      canRaffle = false;
      var item = $(e.target).parent();
      item.addClass('raffle-animate');
      var newRaffleValue = Template.instance().newRaffleValue;
      Meteor.call('generateCoupon', this.courseAttendanceId, 4, function(error, result){
        item.removeClass('raffle-animate');
        if(error){
          return throwError(error.reason);
        }

        newRaffleValue.set(result);
        setRaffleValue(result, item.attr('id'));
       });
    }
  }
});
Template.raffle.helpers({
  img: function(){
    return 'https://s3-ap-southeast-1.amazonaws.com/my.images.head/12222222229/1437104183029.jpg';
  },
  hasCouponStatus: function(){
    var ret = Template.instance().newRaffleValue.get();
    if(ret){
      for(var i=0; i< ret.length; i++){
        if(ret[i].exist){
          return 3;
        }
      }
      return 1;
    }
    return 2;
  }
});
function removeRaffleImgShow(){
  $('.raffle-view img').remove();
  $('.raffle-money-view').css('display','block');
}
function setRaffleValue(ret, selectId){
  removeRaffleImgShow();
  var itemIds = ['raffleA', 'raffleB', 'raffleC', 'raffleD'];
  var isNew = true;
  for(var i=0; i<ret.length; i++){
    if(ret[i].exist){
      isNew = false;
      break;
    }
  }
  for(var i=0;i<ret.length;i++){
    if(ret[i].exist || ret[i].select){
      $('#'+selectId + ' > div > div:last-child').html(ret[i].value);
      $('#'+selectId).css('background-color', '#D26060');
    }else{
      var cId = itemIds.shift();
      if(cId == selectId){
        cId = itemIds.shift();
      }
      $('#'+cId + ' > div > div:last-child').html(ret[i].value);
    }
  }
}
