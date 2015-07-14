AreaOfChina = function (options) {
	findArea = function(code, callback) {
		return Meteor.call('findArea', code, callback);
	}

	getProvince = function(callback) {
		return Meteor.call('getProvince', callback);
	}

	getSubAreas = function(code, callback) {
		return Meteor.call('getSubAreas', code, callback);
	}

	return {findArea:findArea,getProvince:getProvince,getSubAreas:getSubAreas};
};
