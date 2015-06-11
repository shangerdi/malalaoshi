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