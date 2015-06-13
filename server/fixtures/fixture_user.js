if (Meteor.users.find().count() === 0) {

  (function (options) {
    /**
     * 超级管理员用户{role: admin}   可以创建删除用户
     * 普通管理员用户{role: manager} 审查数据
     * 老师用户{role: teacher}       教师，审核认证后才可以被学生或家长看到
     * 学生(或家长){role: student}
     * ...
     */
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
