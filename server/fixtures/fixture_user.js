if (Meteor.users.find().count() === 0) {

  (function(options) {
    var adminUsers = [
      {
        username: "18611623605",
        phoneNo: "18611623605",
        profile: {
          name: "Liang Sun"
        }
      }, {
        username: "18613888646",
        phoneNo: "18613888646",
        profile: {
          name: "Mengjun Liu"
        }
      }, {
        username: "18610772668",
        phoneNo: "18610772668",
        profile: {
          name: "Xin Li"
        }
      }, {
        username: "15801690996",
        phoneNo: "15801690996",
        profile: {
          name: "Erdi Shang"
        }
      }
    ];

    initAdminIntoDb = function() {
      _.each(adminUsers, function(userData) {
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
  try {
    for (var i = 0; i < 10; i++) {
      var id = '0000' + i;
      var t = Meteor.users.findOne({username: id});
      if (t) {
        return;
      }
      var userData = {
        username: id,
        phoneNo: id,
        profile: {
          name: "测试老师" + i
        },
        role: 'teacher'
      };
      Accounts.insertUserDoc({}, userData);

      var t = Meteor.users.findOne({username: id});
      var ta = {
        userId: t._id,
        name: t.profile.name,
        applyStatus: i % 2 ? 'passed' : 'started',
        type: i % 3 ? 'fullTime' : 'partTime',
        price: 0.01,
        basicInfo: {
          submitTime: Date().now,
          status: 'approved',
          msg: 'Good good.',
          auditTime: Date().now,
          auditUserId: Date().now
        },
        eduInfo: {
          submitTime: Date().now,
          status: 'approved',
          msg: 'Good good.',
          auditTime: Date().now,
          auditUserId: Date().now
        },
        certInfo: {
          submitTime: Date().now,
          status: 'approved',
          msg: 'Good good.',
          auditTime: Date().now,
          auditUserId: Date().now
        },
        auditTime: Date().now,
        auditUserId: 'robot',
        experience: [{
          id: 'I do not know what this is for',
          startDate: 'To Be Defined',
          endDate: 'To Be Defined',
          content: '在新东方工作'
        }],
        eduResults: [{
          id: 'I do not know what this is for',
          title: '博士毕业',
          doneDate: 'To Be Defined',
          content: '海南大学'
        }],
        personalPhoto: [
        ]
      };
      TeacherAudit.insert(ta);
      var phases = ScheduleTable.geneWeeklyTimePhases(ta.type==='fullTime'?false:Math.random());
      TeacherAvailableTimes.insert({'teacher': {'id': t._id, 'name': t.profile.name}, 'phases': phases});
    }
  } catch (ex) {
    console.log("Error: init test teacher accounts");
  }
})();
// init some test parent accounts
(function() {
  try {
    for (var i = 0; i < 10; i++) {
      var id = '0001' + i;
      var t = Meteor.users.findOne({username: id});
      if (t) {
        return;
      }
      var userData = {
        username: id,
        phoneNo: id,
        profile: {
          name: "测试家长" + i
        },
        role: 'parent'
      }
      Accounts.insertUserDoc({}, userData);
    }
  } catch (ex) {
    console.log("Error: init test parent accounts");
  }
})();

//init for TeacherBalance(after all user init done)
TeacherBalance.remove({});
(function() {
  Meteor.users.find({"role": "teacher"}).
    forEach(function(teacher) {
      var found = TeacherBalance.findOne({"userId": teacher._id});
      if (!found) {
        // todo: for test will assign 500 RMB to every teacher
        // MUST BE DELETED before online!!!!!
        TeacherBalance.insert({userId: teacher._id, balance: 500, bankCards: []});
      }
    });
})();

//add some coupons for test
(function() {
  Meteor.users.find({'username': /^0001/, 'role': 'parent'}).
    forEach(function(parent) {
      var ct = Coupons.find({userId: parent._id}).count();
      if(ct == 0){
        var newCoupon = {
          value:  Math.floor(Math.random() * 20),
          minCost: 1,
          status: 'new',
          userId: parent._id
        };
        Coupons.insert(newCoupon);
      }
    });
})();

//add some orders for test
(function(){
  var testPhases = [
      {
          "weekday" : 1,
          "phase" : {
              "start" : 480,
              "end" : 600
          }
      },
      {
          "weekday" : 2,
          "phase" : {
              "start" : 600,
              "end" : 720
          }
      },
      {
          "weekday" : 4,
          "phase" : {
              "start" : 600,
              "end" : 720
          }
      },
      {
          "weekday" : 3,
          "phase" : {
              "start" : 780,
              "end" : 900
          }
      },
      {
          "weekday" : 7,
          "phase" : {
              "start" : 780,
              "end" : 900
          }
      },
      {
          "weekday" : 1,
          "phase" : {
              "start" : 900,
              "end" : 1020
          }
      },
      {
          "weekday" : 4,
          "phase" : {
              "start" : 900,
              "end" : 1020
          }
      },
      {
          "weekday" : 5,
          "phase" : {
              "start" : 900,
              "end" : 1020
          }
      },
      {
          "weekday" : 5,
          "phase" : {
              "start" : 1020,
              "end" : 1140
          }
      },
      {
          "weekday" : 6,
          "phase" : {
              "start" : 1020,
              "end" : 1140
          }
      },
      {
          "weekday" : 3,
          "phase" : {
              "start" : 1140,
              "end" : 1260
          }
      },
      {
          "weekday" : 7,
          "phase" : {
              "start" : 1140,
              "end" : 1260
          }
      }
  ];

  var testTeachers = Meteor.users.find({'username': /^0000/, 'role': 'teacher'}).fetch();
  var teacherIndex = 0;
  var teachersLength = testTeachers.length;
  Meteor.users.find({'username': /^0001/, 'role': 'parent'}).
    forEach(function(parent) {
      var ct = Orders.find({'student.id': parent._id}).count();
      if(ct > 0){
        return;
      }
      var teacher = testTeachers[(teacherIndex++) % teachersLength];
      var phase = testPhases[Math.floor(Math.random() * testPhases.length)];
      var order = {
        student: {
          id: parent._id,
          phoneNo: parent.phoneNo,
          name: parent.username
        },
        teacher: {
          id: teacher._id,
          name: teacher.username
        },
        subject: '小学语文',
        status: 'submited',
        hour: 1,
        cost: 400,
        price: 400,
        phases: [
          {
            weekday: phase.weekday,
            start: phase.phase.start,
            end: phase.phase.end
          }
        ],
        lng: 116.483572,
        lat: 39.912365,
        submitUserId: parent._id
      };

      Orders.insert(order);
    });


    //add some courseAttendances for test


    //add some comments for test

})();
