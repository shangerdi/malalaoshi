submitTransaction = function(details) {
  //要修改的余额，负数为减少
  var increasedAmount = 0;
  //计算总共需要更改的金额(增加 或 减少)
  details.forEach(function(detail) {
    increasedAmount += detail.amount;
  });
  //todo: maybe to do this with another better way
  var curBalance = TeacherBalance.findOne({userId: details[0].userId});
  if (curBalance.balance + increasedAmount < 0) {
    //余额不足
    console.log("balance not enough");
    throw new Meteor.Error('余额不足', "余额不足");
  }

  //写入交易明细
  details.forEach(function(detail) {
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
  for (var i in obj) {
    var property = obj[i];
    description += i + " = " + property + "\n";
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
  resetWithdrawPass: function(resetPassInfo) {
    if (!resetPassInfo || !resetPassInfo.newPass || resetPassInfo.newPass.length == 0) {
      throw new Meteor.Error('密码不能为空', '密码不能为空');
    }
    var curBalance = TeacherBalance.findOne({userId: this.userId});
    //check the token unless user not set password yet
    if (curBalance.withdrawPass && resetPassInfo.token != curBalance.token) {
      console.log("Someone try to reset password without token, blocked!");
      throw new Meteor.Error('身份验证失败', '身份验证失败');
    }

    var encryptedPass = CryptoJS.HmacMD5(resetPassInfo.newPass, this.userId).toString();
    var token = Math.random() + 1;
    TeacherBalance.update({userId: this.userId}, {$set: {withdrawPass: encryptedPass, isSetPass: true, token: token, tryTimes: 0}});
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

    //todo: 假定 实名认证通过，返回重置密码所需要的token
    result.success = true;
    result.token = Math.random() + 1;
    TeacherBalance.update({userId: this.userId}, {$set: {token: result.token}});
    return result;
    //todo: 现有方式可直接通过 Router.go() 跳转到重置密码页面，需要完善和解决此处安全问题
  },
  withdraw: function(withdrawInfo) {
    //params
    withdrawInfo.amount;
    withdrawInfo.cardNumber;
    withdrawInfo.cardUserName;
    withdrawInfo.bankCardName;
    withdrawInfo.password;

    console.log(writeObj(withdrawInfo));

    var curUser = Meteor.user();
    if (!curUser || !curUser.role) {
      throw new Meteor.Error('权限不足', "需要登录");
    }

    //numberic the amount
    if (withdrawInfo) {
      withdrawInfo.amount = Number(withdrawInfo.amount);
    }

    //amount must > 0
    if (withdrawInfo.amount <= 0) {
      throw new Meteor.Error('提现金额错误', "提现金额错误");
    }

    if (!withdrawInfo
//    || !withdrawInfo.amount
//    || !withdrawInfo.password
      || !withdrawInfo.cardNumber
      || !withdrawInfo.cardUserName
      || !withdrawInfo.bankCardName) {
      throw new Meteor.Error('参数错误', "参数错误");
    }

    var result = {};

    var balance = TeacherBalance.findOne({userId: this.userId}, {fields: {tryTimes: 1}});
    //连续3次密码错误则需要重置密码
    if (balance.tryTimes >= 3) {
      result.success = false;
      result.errorType = 'locked';
      result.errorMsg = '提现密码已被锁定，建议您找回密码';
      return result;
    }

    //verify input password
    var encryptedPass = CryptoJS.HmacMD5(withdrawInfo.password, this.userId).toString();
    var isFound = TeacherBalance.findOne({userId: this.userId, withdrawPass: encryptedPass});
    if (!isFound) {
      //错误次数 ＋1
      TeacherBalance.update({userId: this.userId}, {$inc: {tryTimes: 1}});
      var balance = TeacherBalance.findOne({userId: this.userId}, {fields: {tryTimes: 1}});
      //连续3次密码错误则需要重置密码
      if (balance.tryTimes >= 3) {
        result.success = false;
        result.errorType = 'locked';
        result.errorMsg = '提现密码已被锁定，建议您找回密码';
        return result;
      }
      else {
        result.success = false;
        result.errorType = 'retry';
        result.errorMsg = '提现密码错误，您还可以输入' + (3 - balance.tryTimes) + '次';
        return result;
      }
    }
    else {
      //输入正确，恢复错误次数为 0
      TeacherBalance.update({userId: this.userId}, {$set: {tryTimes: 0}});
    }

    //var up = new UnionPay;
    //var customerInfo = up.customerInfo({
    //  phoneNo: '13552535506',
    //  customerNm: '全渠道'
    //});
    //var params = {
    //  txnType: '72',
    //  txnSubType: '01',
    //  bizType: '000201',
    //  channelType: '07',
    //  orderId: moment().format('YYYYMMDDHHmmss'),
    //  txnTime: moment().format('YYYYMMDDHHmmss'),
    //  accNo: '6216261000000000018',
    //  customerInfo: customerInfo,
    //  relTxnType: '02',
    //  payCardType: '01'
    //};
    //
    //up.build(params);
    //var ret = up.request();
    //console.log(ret);

    //提现 明细
    var withdrawDetail = {};
    withdrawDetail.userId = curUser._id;
    withdrawDetail.amount = withdrawInfo.amount * -1;
    withdrawDetail.title = "提现";
    withdrawDetail.operator = {'id': curUser._id, 'role': curUser.role};

    var transactionDetails = [];
    transactionDetails.push(withdrawDetail);

    //提交交易
    submitTransaction(transactionDetails);
    //todo: 调用银行接口打款
    //Meteor.call("pay");

    result.success = true;
    return result;
  }
});
