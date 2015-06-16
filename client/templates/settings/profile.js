Template.profile.onRendered(function() {
	var stateMap = {
		1: "在职教师",
		2: "准教师"
	};
	var stateStr = stateMap[Meteor.user().profile.state];
	if (stateStr) {
		$("#state").text(stateStr);
	}
});
Template.profile.helpers({
  notInTopCity: function() {
    var curUser = Meteor.user();
    if (!curUser || !curUser.profile) {
      return true;
    }
    var userAddress = curUser.profile.address;
    if (userAddress && userAddress.province && userAddress.province.type==1) {
      return false;
    }
    return true;
  },
  headImgUrl: function() {
    var curUser = Meteor.user();
    if (curUser && curUser.profile && curUser.profile.headImgUrl) {
      return curUser.profile.headImgUrl;
    }
    return "/images/head.png";
  }
});
