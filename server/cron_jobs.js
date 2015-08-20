// Todo: config
// SyncedCron.config({
// });

var batchConfirmCourseAttendancesByIds = function(ids) {
  if (!ids.length) return;
  // console.log(ids);
  CourseAttendances.update({'_id': {$in: ids}},
   {$set:{state:ScheduleTable.attendanceStateDict["attended"].value, 'detail.confirmType': 2}},
   {multi: true}
  );
}
SyncedCron.add({
  name: 'Auto confirm attended course, when it is timeout and student does not confirm attended course',
  schedule: function(parser) {
    // parser is a later.parse object
    return parser.text('every 5 mins');
  }, 
  job: function(jobTime) {
    var now = new Date(), deadline = now.getTime() - ScheduleTable.timeToConfirm;
    var buf = [], count = 0;
    CourseAttendances.find({'endTime':{$lte:deadline}, 'state': ScheduleTable.attendanceStateDict["reserved"].value}, {'limit': 5000})
      .forEach(function (item) {
        buf.push(item._id);
        if (buf.length==300) {
          count += buf.length;
          batchConfirmCourseAttendancesByIds(buf);
          buf = [];
        }
      });
    if (buf.length) {
      count += buf.length;
      batchConfirmCourseAttendancesByIds(buf);
      buf = [];
    }
    return "Count " + count + " is processed";
  }
});

Meteor.startup(function () {
  SyncedCron.start();
});
