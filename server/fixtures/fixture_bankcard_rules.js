if (BankCardRules.find().count() === 0) {
  var rulesArray = getRules();
  _.each(rulesArray, function(rule) {
    BankCardRules.insert(rule);
  });
}

//only put some use cases of '招商银行'
function getRules() {
  return [
    {
      orgCode: "03080000",
      bankName: "招商银行",
      cardName: "一卡通(银联卡)",
      cardType: "借记卡",
      totalSize: 16,
      binCodeSize: 5,
      binCode: "95555"
    },
    {
      orgCode: "03080000",
      bankName: "招商银行",
      cardName: "招行一卡通",
      cardType: "借记卡",
      totalSize: 15,
      binCodeSize: 6,
      binCode: "690755"
    },
    {
      orgCode: "03080000",
      bankName: "招商银行",
      cardName: "招行一卡通",
      cardType: "借记卡",
      totalSize: 18,
      binCodeSize: 6,
      binCode: "690755"
    },
    {
      orgCode: "03080000",
      bankName: "招商银行",
      cardName: "金卡",
      cardType: "借记卡",
      totalSize: 16,
      binCodeSize: 6,
      binCode: "622609"
    },
    {
      orgCode: "03080000",
      bankName: "招商银行",
      cardName: "公司卡(银联卡)",
      cardType: "借记卡",
      totalSize: 16,
      binCodeSize: 6,
      binCode: "622598"
    },
    {
      orgCode: "03080000",
      bankName: "招商银行",
      cardName: "一卡通(银联卡)",
      cardType: "借记卡",
      totalSize: 16,
      binCodeSize: 6,
      binCode: "622588"
    },
    {
      orgCode: "03080000",
      bankName: "招商银行",
      cardName: "一卡通(银联卡)",
      cardType: "借记卡",
      totalSize: 16,
      binCodeSize: 6,
      binCode: "622580"
    },
    {
      orgCode: "03080000",
      bankName: "招商银行",
      cardName: "金葵花卡",
      cardType: "借记卡",
      totalSize: 16,
      binCodeSize: 6,
      binCode: "621286"
    }
  ];
}
