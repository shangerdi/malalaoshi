var findAvailablePhase = function(i, start, end) {
  var tct = TeacherAvailableTimes.findOne({"teacher.id": Meteor.userId()});
  var availablePhases = (tct && tct.phases)?tct.phases:null;
  var tmp = _.find(availablePhases, function(obj){
    return obj.weekday==i && obj.phase.start==start && obj.phase.end==end;
  });
  return tmp;
}
var saveScheduleWeekly = function(e) {
  var phases = [], errors={hasError:false}, changed = false;
  $("td.phase").each(function(){
    $this = $(this);
    if ($this.hasClass('removed')) {
      changed = true;
      return;
    }
    if (!$this.hasClass('available') && !$this.hasClass('chosen')) {
      return;
    }
    if ($this.hasClass('chosen')) {
      changed = true;
    }
    i = $this.data('weekday'), start = $this.data('start'), end = $this.data('end');
    phases.push({weekday:i, phase:{start:start, end:end}})
  });
  // console.log(phases);
  if (!changed) {
    errors.save = "没有变化";
    errors.hasError=true;
  }
  Session.set('errors', errors);
  if (errors.hasError) {
    return;
  }

  $(e.currentTarget).addClass("disabled");
  Meteor.call('saveAvailableTime', {'phases':phases}, function(err, result) {
    if(err){
      errors.save=err.reason;
      Session.set('errors', errors);
      $(e.currentTarget).removeClass("disabled");
      return throwError(err.reason);
    }
    alert("保存成功");
    $(e.currentTarget).removeClass("disabled");
    $("td.phase").removeClass("removed").removeClass("chosen");
    // go back
    if (Meteor.isCordova) {
      navigator.app && navigator.app.backHistory && navigator.app.backHistory();
    // } else {
    //   history.back();
    }
  });
}
var isPartTime = function() {
  if (!Meteor.userId()) return null;
  var auditObj = TeacherAudit.findOne({'userId': Meteor.userId()});
  return auditObj && auditObj.type==='partTime';
}
Template.scheduleWeekly.onCreated(function() {
  // define cache data
  this.cacheData = this.cacheData || {};
  if (!Meteor.user()) {
    this.cacheData.notLogin = true;
    return;
  }
  // 查询时间段
  var address = Meteor.user().profile.address, timePhases=null;
  if (address) {
    if (!timePhases && address.district && address.district.code) {
      timePhases = AreaTimePhases.findOne({code: address.district.code});
    }
    if (!timePhases && address.city && address.city.code) {
      timePhases = AreaTimePhases.findOne({code: address.city.code});
    }
    if (!timePhases && address.province && address.province.code) {
      timePhases = AreaTimePhases.findOne({code: address.province.code});
    }
  }
  if (!timePhases) {
    timePhases = ScheduleTable.defaultTimePhases;
  }
  this.cacheData.timePhases = timePhases.sort(function(a,b){return a.start-b.start;});
  Session.set('errors','');
});

Template.scheduleWeekly.onRendered(function(){
  $("[data-action=save-schedule-weekly]").click(saveScheduleWeekly);
});

Template.scheduleWeekly.helpers({
  errorMessage: function(field) {
    return Session.get('errors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('errors')[field] ? 'has-error' : '';
  },
  lessonCounts: function() {
    var tct = TeacherAvailableTimes.findOne({"teacher.id": Meteor.userId()});
    var availablePhases = (tct && tct.phases)?tct.phases:null;
    return availablePhases?availablePhases.length:0;
  },
  timePhases: function() {
    return Template.instance().cacheData.timePhases;
  },
  days: function() {
    return ScheduleTable.days;
  },
  getPhaseState: function(i, start, end) {
    var tmp = findAvailablePhase(i, start, end);
    if (tmp) {
      return 'available';
    } else {
      return 'unavailable';
    }
  },
  isPartTime: function() {
    return isPartTime();
  }
});
Template.scheduleWeekly.events({
  'click td.phase': function(e) {
    if (!isPartTime()) {
      return;
    }
    Session.set('errors','');
    var ele=e.target, $ele = $(ele);
    // alert('周'+ScheduleTable.dayNumWords[$ele.data('weekday')]+"  "+convMinutes2Str($ele.data('start'))+"  "+convMinutes2Str($ele.data('end')));
    if ($ele.hasClass("available")) {
      $ele.toggleClass("removed");
    } else {
      $ele.toggleClass("chosen");
    }
  },
  'click .btn-save': function(e) {
    saveScheduleWeekly(e);
  }
});
