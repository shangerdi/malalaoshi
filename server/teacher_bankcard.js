
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
  addNewCard: function(cardInfo) {
    //TODO: verify following information
    //cardInfo.cardNumber;
    //cardInfo.cardUserName;
    //cardInfo.cardPhoneNumber;
    //verify(cardInfo);
    var result = {};
    result.success = false;
    result.errorMsg = "户名不匹配 or 信息有误";
    result.errorMsg = "手机号不匹配，到柜台修改";
    //todo: 假定验证码通过 and 实名认证通过
    result.success = true;
    if (result.success === true) {
      var bankCard = {};
      bankCard.cardUserName = cardInfo.cardUserName;
      bankCard.bankName = cardInfo.bankName;
      bankCard.cardNumber = cardInfo.cardNumber;
      TeacherBalance.update({userId: this.userId}, {$addToSet: {bankCards: bankCard}});
    }

    return result;
  },
  resetWithdrawPass: function(newPass) {
    //todo: 假定通过了认证，允许重置密码
    if (newPass && newPass.length !== 0) {
      var encryptedPass = CryptoJS.HmacMD5(newPass, this.userId).toString();
      console.log(encryptedPass);
      TeacherBalance.update({userId: this.userId}, {$set: {withdrawPass: encryptedPass, isSetPass: true}});
    }
    else {
      console.log("resetWithdrawPass Error!");
      throw new Meteor.Error('密码不能为空', '密码不能为空');
    }
  }
});
