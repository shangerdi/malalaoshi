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
// init some test teacher accounts
(function() {
  try{
    for (var i=0; i<10; i++) {
      var testTeacherId = 'test_00000'+i;
      var t = Meteor.users.findOne({username:testTeacherId});
      if (t) {
        return;
      }
      var userData = {
        username: testTeacherId,
        phoneNo: testTeacherId,
        profile: {
          name: "测试老师"+i
        },
        role: 'teacher'
      }
      Accounts.insertUserDoc({}, userData);
    }
  }catch(ex){
    console.log("Error: init test teacher accounts");
  }
})();
