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
  // @see user.js & user_education.js
  var generateTestSubjects = function(count) {
    var a=[], // only 小学
      subjects = _.keys(getEduSubjectDict()).slice(0,3),
      grades = _.keys(getEduGradeDict()).slice(0,6);
      grades.push('all');
      grades = _.shuffle(grades);
    for(k=0; k<count; k++){
      a.push({stage:'elementary', subject:subjects[_.random(0,subjects.length-1)], grade:grades[k]});
    }
    return a;
  }
  var setSubjectsPrice = function(subjects) {
    var a = _.clone(subjects);
    _.each(a, function(obj){
      obj.price = _.random(1,2);// price is penny and type is int
    });
    return a;
  }
  // @see fix_study_center.js
  var generateTestStudyCenterIds = function(count) {
    var a=[], k=0, ids = _.shuffle([1,2,3,4,5,6]);
    for(k=0; k<count; k++){
      a.push('testid'+ids[k]);
    }
    return a;
  }
  try {
    for (var i = 0; i < 10; i++) {
      var id = '0000' + i;
      var t = Meteor.users.findOne({username: id});
      if (t) {
        var ta = TeacherAudit.findOne({userId: t._id});
        // check if it needs to re-init
        if (!t.profile.teacherType || !ta || !ta.prices) {
          console.log("re-init test teachers data");
          Meteor.users.find({username: /^0000.*/}).forEach(function(tmp){
            Meteor.users.remove({_id: tmp._id});
            TeacherAudit.remove({userId: tmp._id});
          });
        } else {
          return;
        }
      }
      var userData = {
        username: id,
        phoneNo: id,
        profile: {
          name: "测试老师" + i,
          teacherType: i%3?'studyCenter':'goHome',
          studyCenters: i%3?generateTestStudyCenterIds(3):[],
          subjects: generateTestSubjects(i%5),
          prices: [{price: 1}]// price is penny and type is int
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
        // price: 200, modified by Erdi
        prices: [{price: 1}],// price is penny and type is int
        basicInfo: {
          submitTime: Date.now(),
          status: 'approved',
          msg: 'Good good.',
          auditTime: Date.now(),
          auditUserId: Date.now()
        },
        eduInfo: {
          submitTime: Date.now(),
          status: 'approved',
          msg: 'Good good.',
          auditTime: Date.now(),
          auditUserId: Date.now()
        },
        certInfo: {
          submitTime: Date.now(),
          status: 'approved',
          msg: 'Good good.',
          auditTime: Date.now(),
          auditUserId: Date.now()
        },
        auditTime: Date.now(),
        auditUserId: 'robot',
        experience: [{
          id: 'I do not know what this is for',
          startDate: Date.now(),
          endDate: Date.now(),
          content: '在新东方工作'
        }],
        eduResults: [{
          id: 'I do not know what this is for',
          title: '博士毕业',
          doneDate: Date.now(),
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
//TeacherBalance.remove({});
//TransactionDetail.remove({});
(function() {
  Meteor.users.find({"role": "teacher"}).
    forEach(function(teacher) {
      var found = TeacherBalance.findOne({"userId": teacher._id});
      if (!found) {
        TeacherBalance.insert({userId: teacher._id, bankCards: []});
        // todo: for test will assign 50.00 RMB to every teacher
        // MUST BE DELETED before online!!!!!
        TeacherBalance.update({userId: teacher._id}, {$inc: {balance: 50*100}});//number of fen
        TransactionDetail.insert({
          userId: teacher._id,
          amount: 50*100,//number of fen
          title: '平台测试补助',
          operator: {
            role: 'system'
          }
        });
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
    var testOrders = Orders.find({'student.name': /^0001/, 'status': 'submited'}).fetch();
    var addOrdersLength = testOrders.length/2;
    addOrdersLength = addOrdersLength < 2 ? 0 : addOrdersLength;

    for(var i=0; i<addOrdersLength; i++){
      var od = testOrders[i];
      var student = Meteor.users.findOne({_id: od.student.id});
      var teacher = Meteor.users.findOne({_id: od.teacher.id});
      var toInsertList = ScheduleTable.generateReserveCourseRecords(student, teacher, od.hour, od.phases, false, od);
      _.each(toInsertList, function(data){
        if(CourseAttendances.find({
          'teacher.id': data.teacher.id,
          'student.id': data.student.id,
          'endTime': data.endTime,
          'weekday': data.weekday,
          'phase': data.phase,
          'state': ScheduleTable.attendanceStateDict['reserved'].value,
          'detai': data.detail
        }).count() == 0){
          CourseAttendances.insert(data);
        }
      });

      Orders.update({_id: od._id}, {$set: {'status': 'paid'}});
    }

    //add some comments for test
    var courseAttendancesAry = [];
    CourseAttendances.find({'state': ScheduleTable.attendanceStateDict['reserved'].value}).forEach(function(csAtt){
      var u = Meteor.users.findOne({_id: csAtt.student.id});
      if(u.username.toString().indexOf('0001') == 0){
        courseAttendancesAry.push(csAtt);
      }
    });
    var courseAttendancesAryLength = courseAttendancesAry.length - 2;
    for(var i=0; i<courseAttendancesAryLength; i++){
      var csAtt = courseAttendancesAry[i];
      var comment = {
        maScore: Math.floor(Math.random()*5),
        laScore: Math.floor(Math.random()*5),
        courseAttendanceId: csAtt._id,
        comment: '评论测试内容',
        teacher: csAtt.teacher,
        student: csAtt.student
      };
      Comments.insert(comment, function(error, result){
        if(!error){
          CourseAttendances.update({_id: comment.courseAttendanceId}, {$set: {'state': ScheduleTable.attendanceStateDict['commented'].value}});
          Meteor.users.update({_id: comment.teacher.id}, {$inc: {"profile.maScore": comment.maScore, "profile.maCount": 1, "profile.laScore": comment.laScore, "profile.laCount": 1}});
          var total = (comment.maScore || 0) + (comment.laScore || 0);

          if(total <= 2){
            UserSummary.update({'userId': comment.teacher.id}, {$inc: {'poolComments': 1}}, {upsert: true});
          }else if(total > 2 && total < 8){
            UserSummary.update({'userId': comment.teacher.id}, {$inc: {'averageComments': 1}}, {upsert: true});
          }else if(total >= 8 && total <= 10){
            UserSummary.update({'userId': comment.teacher.id}, {$inc: {'goodComments': 1}}, {upsert: true});
          }
        }
      });
    }
})();

// add some messages test data
(function(){
  if (Messages.find().count()>20) {
    return;
  }
  var generateRandWords = function(len) {　　
    var $chars = ' qwert yuiop asdfg hjkl zxcvbnm '; // qwert键盘按键顺序
    var maxPos = $chars.length;　　
    var str = '';　　
    for (i = 0; i < len; i++) {　　　　
      str += $chars.charAt(Math.floor(Math.random() * maxPos));　　
    }　　
    return str;
  }

  var uids = Meteor.users.find({},{fields:{_id:1}}).fetch();
  for (var u=0; u<uids.length; u++) {
    var flag = _.random(1,5)>1;
    if (!flag) continue;
    var curUid = uids[u]._id;
    var count = _.random(1,20);
    for (var k=0; k<count; k++) {
      Messages.insert({
        userId: curUid,
        type: Messages.Types[_.random(0,Messages.Types.length-1)],
        content: 'Test message: ' + generateRandWords(Math.ceil(Math.random()*100))
      });
    }
  }
})();
