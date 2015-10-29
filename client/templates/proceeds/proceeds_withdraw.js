var submitWithdraw = function(withdrawInfo) {
  Meteor.call('withdraw', withdrawInfo, function(error, result) {
    if (error) {
      IonPopup.alert({
        title: error.reason,
        okText: "确定"
      });
      return throwError(error.reason);
    }

    if (result && result.success == false) {
      //已经锁定
      if (result.errorType == 'locked') {
        IonPopup.confirm({
          title: result.errorMsg,
          cancelText: "确定",
          okText: "重置提现密码",
          onOk: function() {
            Router.go("proceedsResetPasswordStep1");
          }
        });
      }
      //密码错误，提醒可用的重试次数
      else if (result.errorType == 'retry') {
        IonPopup.alert({
          title: result.errorMsg,
          okText: "确定"
        });
      }
    }
    //提现成功
    else {
      IonPopup.alert({
        title: "提现成功!",
        okText: "确定",
        onOk: function() {
          IonNavBack();
        }
      });
    }
  });
};

var getWithdrawCard = function() {
  var selectedCard = {};
  var cardStoredStr = localStorage.getItem('withdrawCard');
  if (!cardStoredStr) {
    return null;
  }
  try {
    var cardStored = JSON.parse(cardStoredStr);
  } catch (e) {
    return null;
  }
  var teacherBalance = TeacherBalance.findOne();
  teacherBalance.bankCards.forEach(function(card) {
    if (card.cardNumber == cardStored.cardNumber) {
      selectedCard = card;
      return false;
    }
  });
  return selectedCard;
}

Template.proceedsWithdraw.helpers({
  //add you helpers here
  teacherBalance: function() {
    return TeacherBalance.findOne();
  },
  getWithdrawCard: function() {
    return getWithdrawCard();
  }
});

Template.proceedsWithdraw.events({
  //add your events here
  'click [data-action=input-password]': function() {
    var amount = Number($("#amount").val());
    if (amount <= 0) {
      IonPopup.alert({
        title: "请输入正确的金额",
        okText: "确定",
        onOk: function() {
          $("#amount").focus();
        }
      });
    }
    else {
      IonPopup.prompt({
        title: "请输入提现密码",
        subTitle: amount + " 元",
        okText: '确认提现',
        cancelText: "取消",
        inputType: 'password',
        onOk: function(event, inputVal) {
          var withdrawInfo = {};
          withdrawInfo.amount = amount;
          withdrawInfo.cardNumber = getWithdrawCard() ? getWithdrawCard().cardNumber : null;
          withdrawInfo.cardUserName = getWithdrawCard() ? getWithdrawCard().cardUserName : null;
          withdrawInfo.bankName = getWithdrawCard() ? getWithdrawCard().bankName: null;
          withdrawInfo.password = inputVal;
          setTimeout(function() {
            submitWithdraw(withdrawInfo);
          }, 100);
          ;
        }
      });
    }
  }
});

Template.proceedsWithdraw.onCreated(function() {
  //add your statement here
});

Template.proceedsWithdraw.onRendered(function() {
  //add your statement here
});

Template.proceedsWithdraw.onDestroyed(function() {
  //add your statement here
});

