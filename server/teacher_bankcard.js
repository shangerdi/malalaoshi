
function writeObj(obj){
  var description = "";
  for(var i in obj){
    var property=obj[i];
    description+=i+" = "+property+"\n";
  }
  return description;
}

Meteor.methods({
  getCardInfo: function(cardNumber) {
    //TODO: process the cardNumber matching
    //fetchCardInfo(cardNumber);

    var binCodeSizeArray = [];
    BankCardRules.find({}, {fields: {binCodeSize: 1}, sort: {'binCodeSize': -1}})
      .forEach(function(item) {
        //if (!binCodeSizeArray.contains(item.binCodeSize))
        console.log('binCodeSize: ' + writeObj(item));
      });

      /*
      .forEach(function (item) {
        console.log('binCodeSize: ' + writeObj(item));
    });
    */

    var binCodeSize = 6;
    var binCode = cardNumber.substring(0, binCodeSize);
    var totalSize = cardNumber.length;

    var cardInfo = BankCardRules.findOne({
      binCodeSize: binCodeSize,
      binCode: binCode,
      totalSize: totalSize
    });
    if (!cardInfo) {
      throw new Meteor.Error('卡号错误', '卡号无法识别');
    }
    cardInfo.cardNumber = cardNumber;
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
