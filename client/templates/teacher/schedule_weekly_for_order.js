var convMinutes2Str = CourseTable.convMinutes2Str;
Template.scheduleWeeklyForOrder.onCreated(function() {
  Session.set('errors', {});
  // define cache data
  this.cacheData = this.cacheData || {};
  var teacher = Meteor.users.findOne({_id:Router.current().params.teacherId});
  if (!Meteor.user() && !teacher) {
    this.cacheData.notLogin = true;
    return;
  }
  this.cacheData.teacherId = teacher._id;
  this.cacheData.teacher = teacher;
  // 查询时间段
  var address = teacher.profile.address, timePhases=null;
  if (!timePhases && address.district.code) {
    timePhases = AreaTimePhases.findOne({code: address.district.code});
  }
  if (!timePhases && address.city.code) {
    timePhases = AreaTimePhases.findOne({code: address.city.code});
  }
  if (!timePhases && address.province.code) {
    timePhases = AreaTimePhases.findOne({code: address.province.code});
  }
  if (!timePhases) {
    timePhases = CourseTable.defaultTimePhases;
  }
  this.cacheData.timePhases = timePhases.sort(function(a,b){return a.start-b.start;});
});
Template.scheduleWeeklyForOrder.helpers({
  errorMessage: function(field) {
    return Session.get('errors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('errors')[field] ? 'has-error' : '';
  },
  lessonCounts: function() {
    var tct = TeacherCourseTables.findOne({"teacher.id": Template.instance().cacheData.teacherId});
    var availablePhases = (tct && tct.phases)?tct.phases:null;
    return availablePhases?availablePhases.length:0;
  },
  timePhases: function() {
    return Template.instance().cacheData.timePhases;
  },
  days: function() {
    return CourseTable.days;
  },
  convMinutes2Str: function(mins) {
    return convMinutes2Str(mins);
  },
  getPhaseState: function(i, start, end) {
    var tct = TeacherCourseTables.findOne({"teacher.id": Template.instance().cacheData.teacherId});
    var availablePhases = (tct && tct.phases)?tct.phases:null;
    var tmp = _.find(availablePhases, function(obj){
      return obj.weekday==i && obj.phase.start==start && obj.phase.end==end;
    });
    if (tmp) {
      var now = new Date(), todayTime = new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime(), aWeekLaterTime = todayTime+7*24*60*60*1000;
      var reservedList = CourseAttendances.find({"teacher.id":Template.instance().cacheData.teacherId, attendDay: {$gte: todayTime, $lt: aWeekLaterTime}}).fetch();
      var item = _.find(reservedList, function(obj){
        var tmpDate = new Date(obj.attendDay), weekday = tmpDate.getDay();
        weekday = (weekday==0?7:weekday);
        return weekday==i && obj.phase.start==start && obj.phase.end==end;
      });
      if (item) {
        return 'reserved';
      } else {
        return 'available';
      }
    } else {
      return 'un-available';
    }
  },
  getPhaseText: function(i, start, end) {
    var tct = TeacherCourseTables.findOne({"teacher.id": Template.instance().cacheData.teacherId});
    var availablePhases = (tct && tct.phases)?tct.phases:null;
    var tmp = _.find(availablePhases, function(obj){
      return obj.weekday==i && obj.phase.start==start && obj.phase.end==end;
    });
    if (tmp) {
      var now = new Date(), todayTime = new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime(), aWeekLaterTime = todayTime+7*24*60*60*1000;
      var reservedList = CourseAttendances.find({"teacher.id":Template.instance().cacheData.teacherId, attendDay: {$gte: todayTime, $lt: aWeekLaterTime}}).fetch();
      var item = _.find(reservedList, function(obj){
        var tmpDate = new Date(obj.attendDay), weekday = tmpDate.getDay();
        weekday = (weekday==0?7:weekday);
        return weekday==i && obj.phase.start==start && obj.phase.end==end;
      });
      if (item) {
        return 'r';
      } else {
        return 'a';
      }
    } else {
      return 'u';
    }
  }
});
Template.scheduleWeeklyForOrder.events({
  'click td.phase': function(e) {
    var ele=e.target, $ele = $(ele);
    if ($ele.hasClass("available")) {
      $ele.toggleClass("chosen");
    }
  },
  'click .btn-save': function(e) {
    var lessonCount = parseInt($("input[name=lessonCount").val()), errors={hasError:false};
    if (isNaN(lessonCount) || lessonCount<1) {
      errors.lessonCount="课时数不能小于1";
      errors.hasError=true;
    }
    var phases = [];
    $("td.phase.chosen").each(function(){
      $this = $(this), i = $this.data('weekday'), start = $this.data('start'), end = $this.data('end');
      phases.push({weekday:i, start:start, end:end})
    });
    console.log(phases);
    if(phases.length==0) {
      errors.phases="请点击上面方格选择时间段";
      errors.hasError=true;
    }
    Session.set('errors', errors);
    if (errors.hasError) {
      return;
    }
    $(e.currentTarget).addClass("disabled");
    var teacherId = Template.instance().cacheData.teacherId;
    Meteor.call('reserveCourses', {'teacherId':teacherId, 'lessonCount':lessonCount, 'phases':phases}, function(err, result) {
      if(err){
        errors.lessonCount=err.reason;
        Session.set('errors', errors);
        $(e.currentTarget).removeClass("disabled");
        return throwError(err.reason);
      }
      alert("约课成功");
      $(e.currentTarget).removeClass("disabled");
    });
  }
});
