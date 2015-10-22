var canRaffle = true;
var couponId = '';
Template.raffle.onCreated(function(){
  this.newRaffleValue = new ReactiveVar();
  canRaffle = true;
  couponId = '';
});
Template.raffle.onRendered(function(){
  reSetSize();
  window.onresize = function(){
    reSetSize();
  };
});
Template.raffle.events({
  'click .raffle-table-container td': function(e){
    e.preventDefault();
    if(canRaffle){
      canRaffle = false;
      var newRaffleValue = Template.instance().newRaffleValue;
      var item = $(e.target).closest('td');
      item.addClass('raffle-animate');
      var startTime = new Date().getTime();
      Meteor.call('generateCoupon', this.courseAttendanceId, 9, function(error, result){
        if(error){
          item.removeClass('raffle-animate');
          return throwError(error.reason);
        }
        var selectedId = item.attr('id');
        setCardValue(result, selectedId);
        var timeUsed = new Date().getTime() - startTime;

        var alreadyHave = false;
        if(result){
          for(var i=0; i< result.length; i++){
            if(result[i].exist){
              alreadyHave = true;
              break;
            }
          }
        }

        if(timeUsed < 500){
          Meteor.setTimeout(function(){
            updateRaffle(newRaffleValue, result, selectedId, item, alreadyHave);
          },500-timeUsed);
        }else{
            updateRaffle(newRaffleValue, result, selectedId, item, alreadyHave);
        }
       });
    }
  },
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
  },
  'click #confirm': function(e){
    e.preventDefault();
    Router.go('couponConfirm', {'id': couponId});
  },
  'click .click-prize-show': function(e){
    e.preventDefault();
    $('.raffle-prize-show').css('visibility', 'hidden');
    $('.raffle-whatis-coupon').css('visibility', 'hidden');
  },
  'click #allCouponBtn': function(e){
    Router.go('coupons');
  },
  'click #commentBtn': function(e){
    Router.go('coursesConfirmed');
  },
  'click #whoCoupon': function(e){
    $('.raffle-prize-show').css('visibility', 'hidden');
    $('.raffle-whatis-coupon').css('visibility', 'visible');
  },
  'click #noteBack': function(e){
    $('.raffle-prize-show').css('visibility', 'visible');
    $('.raffle-whatis-coupon').css('visibility', 'hidden');
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
          couponId = ret[i].id;
          return 3;
        }
      }
      return 1;
    }
    return 2;
  },
  proportion: function(){
    var ret = Template.instance().newRaffleValue.get();
    if(ret){
      for(var i=0; i< ret.length; i++){
        if(ret[i].select){
          couponId = ret[i].id;
          return accounting.formatNumber(ret[i].proportion * 100, 0);
        }
      }
    }
  },
  raffleValue: function(){
    var ret = Template.instance().newRaffleValue.get();
    if(ret){
      for(var i=0; i< ret.length; i++){
        if(ret[i].select){
          couponId = ret[i].id;
          return ret[i].value;
        }
      }
    }
  }
});
function removeRaffleImgShow(){
  $('.raffle-view img').remove();
  $('.raffle-money-view').css('display','block');
}
function setRaffleValue(ret, selectId){
  removeRaffleImgShow();
  var itemIds = ['raffleA', 'raffleB', 'raffleC', 'raffleD'];
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
function reSetSize(){
  var docHeight = $('.raffle-page-content').height();
  var tbHeight = docHeight * 0.485;
  var raffInfoTop = docHeight * 0.358;
  var raffValPaddingBottom = docHeight * 0.023;
  $('.raffle-table-container').css('height', tbHeight + 'px');
  $('.raffle-info').css('margin-top', raffInfoTop + 'px');
  $('.raffle-table-container td').css('padding-bottom', raffValPaddingBottom + 'px');
}
function turnCards(selectId, alreadyHave){
  $('#'+selectId).css('background-image', 'none');
  $('#'+selectId).addClass('raffle-selected-reversal-animat');
  $('#'+selectId).css('background-image', 'url(/images/raffle-item-get-act.png)');
  $('#'+selectId+' > div').css('visibility', 'visible');
  Meteor.setTimeout(function(){
    $('.raffle-table-container td[id!="'+selectId+'"]').css('background-image', 'none');
    $('.raffle-table-container td[id!="'+selectId+'"]').addClass('raffle-reversal-animat');
    $('.raffle-table-container td[id!="'+selectId+'"]').css('background-image', 'url(/images/raffle-item-get.png)');
    $('.raffle-table-container td[id!="'+selectId+'"]').addClass('raffle-table-td-with-value');
    Meteor.setTimeout(function(){
      $('.raffle-value').css('visibility', 'visible');
      if(!alreadyHave){
        Meteor.setTimeout(function(){
          $('.raffle-prize-show').css('visibility', 'visible');
        },600);
      }
    }, 300);
  }, 800);
}
function setCardValue(ret, selectId){
  var itemIds = ['raffle_1_1', 'raffle_1_2', 'raffle_1_3', 'raffle_2_1', 'raffle_2_2', 'raffle_2_3', 'raffle_3_1', 'raffle_3_2', 'raffle_3_3'];
  for(var i=0;i<ret.length;i++){
    if(ret[i].exist || ret[i].select){
      $('#' + selectId + ' > div').html('￥' + ret[i].value);
    }else{
      var cId = itemIds.shift();
      if(cId == selectId){
        cId = itemIds.shift();
      }
      $('#' + cId + ' > div').html('￥' + ret[i].value);
    }
  }
}
function updateRaffle(newRaffleValue, result, selectedId, item, alreadyHave){
  newRaffleValue.set(result);
  item.removeClass('raffle-animate');
  turnCards(selectedId, alreadyHave);
}
