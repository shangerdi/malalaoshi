if (Meteor.users.find().count() === 0) {

  (function (options) {
    var adminUsers = [
      {
	    	username: "18611623605",
	    	phoneNo: "18611623605",
        profile: {
          name: "Liang Sun"
        }
	    },{
	    	username: "18613888646",
	    	phoneNo: "18613888646",
        profile: {
          name: "Mengjun Liu"
        }
	    },{
        username: "18610772668",
        phoneNo: "18610772668",
        profile: {
          name: "Xin Li"
        }
      }
    ];

    initAdminIntoDb = function() {
      _.each(adminUsers, function (userData) {
      	var options = {};
      	var user = _.extend({"role": "admin"}, userData);
        Accounts.insertUserDoc(options, user);
      });
    }

    initAdminIntoDb();
  })();
}
