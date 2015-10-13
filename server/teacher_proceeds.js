submitTransaction = function(details) {
  //要修改的余额，负数为减少
  var increasedAmount = 0;
  //多项交易明细
  details.forEach(function(detail) {
    increasedAmount += detail.amount;
    if (detail.courseId) {
      //带有课程信息的明细
      TransactionDetail.insert({
        userId: detail.userId,
        courseId: detail.courseId,
        amount: detail.amount,
        title: detail.title,
        operator: detail.operator
      });
    }
    else {
      //不带有课程信息的明细
      TransactionDetail.insert({
        userId: detail.userId,
        amount: detail.amount,
        title: detail.title,
        operator: detail.operator
      });
    }
  });

  //修改实际余额
  TeacherBalance.update({userId: details[0].userId}, {$inc: {balance: increasedAmount}});
}

writeObj = function(obj) {
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
  },
  identityVerify: function(params) {
    //TODO: verify following information
    //params.cardUserName  持卡人姓名
    //params.IDNumber  身份证号
    //params.cardNumber  卡号
    var result = {};
    //result.success = false;
    //result.errorMsg = "信息填写错误";
    //throw new Meteor.Error('信息填写错误', '信息填写错误');

    //todo: 假定 实名认证通过
    result.success = true;
    return result;
    //todo: 现有方式可直接通过 Router.go() 跳转到重置密码页面，需要完善和解决此处安全问题
  }
});
