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
  return TeacherBalance.update({userId: details[0].userId}, {$inc: {balance: increasedAmount}});
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
      throw new Meteor.Error('卡号无法识别，请添加储蓄卡(借记卡)', '卡号无法识别，请添加储蓄卡(借记卡)');
    }
    return result;
  },
  addNewCard: function(cardInfo) {
    //cardInfo.cardNumber;
    //cardInfo.cardUserName;
    //cardInfo.cardPhoneNumber;
    console.log(writeObj(cardInfo));

    var up = new UnionPay;
    var customerInfo = up.customerInfo({
      phoneNo: cardInfo.cardPhoneNumber,//预留手机号
      customerNm: cardInfo.cardUserName,//户名
      certifTp: '01',                   //证件类型
      //certifId: params.IDNumber       //证件号码
    });
    var params = {
      txnType: '72',                    //交易类型
      txnSubType: '01',                 //交易子类
      bizType: '000201',                //业务类型
      channelType: '07',                //渠道类型
      orderId: moment().format('YYYYMMDDHHmmss'),//商户订单号
      txnTime: moment().format('YYYYMMDDHHmmss'),//订单发送时间
      accNo: cardInfo.cardNumber,       //卡号
      customerInfo: customerInfo,
      relTxnType: '02',
      payCardType: '01'
    };
    //code for test
    if (process.env.NODE_ENV === 'development') {
      customerInfo = up.customerInfo({
        phoneNo: '13552535506',
        customerNm: '全渠道',
        certifTp: '01',
        certifId: '341126197709218366'
      });
      params.accNo = '6216261000000000018';
      params.customerInfo = customerInfo;
    }
    //end of test code
    up.build(params);
    var ret = up.request();

    var result = {};
    if (!ret) {
      result.success = false;
      result.errorMsg = "信息填写错误";
      throw new Meteor.Error('验证失败，信息填写错误', '验证失败，信息填写错误');
    }
    //result.success = false;
    //result.errorMsg = "户名不匹配 or 信息有误";
    //result.errorMsg = "手机号不匹配，到柜台修改";
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
    //params.cardNumber;
    //params.cardUserName;
    //params.IDNumber;
    console.log(writeObj(params));

    var up = new UnionPay;
    var customerInfo = up.customerInfo({
      //phoneNo: '13552535506',         //预留手机号
      customerNm: params.cardUserName,  //户名
      certifTp: '01',                   //证件类型
      certifId: params.IDNumber         //证件号码
    });
    var params = {
      txnType: '72',                    //交易类型
      txnSubType: '01',                 //交易子类
      bizType: '000201',                //业务类型
      channelType: '07',                //渠道类型
      orderId: moment().format('YYYYMMDDHHmmss'),//商户订单号
      txnTime: moment().format('YYYYMMDDHHmmss'),//订单发送时间
      accNo: params.cardNumber,         //卡号
      customerInfo: customerInfo,
      relTxnType: '02',
      payCardType: '01'
    };
    //code for test
    if (process.env.NODE_ENV === 'development') {
      customerInfo = up.customerInfo({
        phoneNo: '13552535506',
        customerNm: '全渠道',
        certifTp: '01',
        certifId: '341126197709218366'
      });
      params.accNo = '6216261000000000018';
      params.customerInfo = customerInfo;
    }
    //end of test code
    up.build(params);
    var ret = up.request();

    var result = {};
    //实名认证没有通过
    if (!ret) {
      result.success = false;
      result.errorMsg = "信息填写错误";
      throw new Meteor.Error('验证失败，信息填写错误', '验证失败，信息填写错误');
    }

    //实名认证通过，返回重置密码所需要的token
    result.success = true;
    result.token = Math.random() + 1;
    TeacherBalance.update({userId: this.userId}, {$set: {token: result.token}});
    return result;
  },
  withdraw: function(withdrawInfo) {
    //params
    //withdrawInfo.amount;
    //withdrawInfo.cardNumber;
    //withdrawInfo.cardUserName;
    //withdrawInfo.bankName;
    //withdrawInfo.password;

    console.log(writeObj(withdrawInfo));

    var curUser = Meteor.user();
    if (!curUser || !curUser.role) {
      throw new Meteor.Error('权限不足', "需要登录");
    }

    if (withdrawInfo) {
      // this amount as user input, need to change from YUAN to fen
      withdrawInfo.amount = parseInt(Number(withdrawInfo.amount)*100);
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
      || !withdrawInfo.bankName) {
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

    //提现 明细
    var withdrawDetail = {};
    withdrawDetail.userId = curUser._id;
    withdrawDetail.amount = withdrawInfo.amount * -1;
    withdrawDetail.title = "提现";
    withdrawDetail.operator = {'id': curUser._id, 'role': curUser.role};

    var transactionDetails = [];
    transactionDetails.push(withdrawDetail);

    //提交交易
    if (submitTransaction(transactionDetails)) {
      //保存提现记录数据用于财物打款
      TeacherWithdraw.insert({
        userId: curUser._id,
        amount: withdrawInfo.amount,
        cardNumber: withdrawInfo.cardNumber,
        cardUserName: withdrawInfo.cardUserName,
        bankName: withdrawInfo.bankName
      });
    } else {
      throw new Meteor.Error('操作失败', "操作失败");
    }
    result.success = true;
    return result;
  }
});
