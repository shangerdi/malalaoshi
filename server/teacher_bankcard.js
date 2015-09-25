
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
    var result = {};
    var binCodeSizefetched = [];
    BankCardRules.find({}, {fields: {binCodeSize: 1}, sort: {'binCodeSize': -1}})
      .forEach(function(item) {
        if (binCodeSizefetched.indexOf(item.binCodeSize) === -1) {
          binCodeSizefetched.push(item.binCodeSize);
          var binCodeSize = item.binCodeSize;
          var binCode = cardNumber.substring(0, binCodeSize);
          var totalSize = cardNumber.length;
          var cardInfo = BankCardRules.findOne({
            binCodeSize: binCodeSize,
            binCode: binCode,
            totalSize: totalSize
          });
          if (cardInfo) {
            result = cardInfo;
            result.cardNumber = cardNumber;
          }
        }
      });
    if (!result.cardNumber) {
      throw new Meteor.Error('卡号无法识别', '卡号无法识别');
    }
    return result;
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
