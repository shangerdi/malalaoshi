Meteor.methods({
  getCardInfo: function(cardNumber) {
    var cardInfo = {};
    cardInfo.cardNumber = cardNumber;
    cardInfo.bankName = "招商银行";
    cardInfo.type = "借记卡";
    //TODO: process the cardNumber matching
    //fetchCardInfo(cardNumber);
    return cardInfo;
  },
  addNewCard: function(params) {
    //TODO: verify following information
    //params.cardNumber;
    //params.accountName;
    //params.reservedPhoneNumber;
    var result = {};
    result.success = false;
    result.errorMsg = "户名不匹配 or 信息有误";
    result.errorMsg = "手机号不匹配，到柜台修改";
    if (result.success === true) {
      //TeacherBalance.insert() or TeacherBalance.update()
    }

    return result;
  }
});
