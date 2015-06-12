Meteor.subscribe('areas');
AreaOfChina = function (options) {
	findArea = function(code) {
		return Areas.findOne({"code":code});
	}

	getProvince = function() {
		return Areas.find({"level":1})
	}

	getSubAreas = function(code) {
		var theArea = findArea(code);
		if (!theArea) {
			return;
		}
		if (theArea.level == 1) {
			return Areas.find({"level":2,"code":{$regex: '^'+theArea.code.substr(0,2)+'.*$', $options: ''}});
		} else if (theArea.level == 2) {
			return Areas.find({"level":3,"code":{$regex: '^'+theArea.code.substr(0,4)+'.*$', $options: ''}});
		}
		return theArea;
	}

	return {findArea:findArea,getProvince:getProvince,getSubAreas:getSubAreas};
};
// Test code, must wait {Meteor.subscribe('areas')} is done;
// var areaOfChina = new AreaOfChina();
// var p = areaOfChina.findArea("110000");
// console.log(p);
// var p = areaOfChina.getProvince();
// console.log(p);
// var p = areaOfChina.getSubAreas("110000");
// console.log(p);
// var p = areaOfChina.getSubAreas("210000");
// console.log(p);
// var p = areaOfChina.getSubAreas("371500");
// console.log(p);
// var p = areaOfChina.getSubAreas("371522");
// console.log(p);
// var p = areaOfChina.getSubAreas("410707");
// console.log(p);