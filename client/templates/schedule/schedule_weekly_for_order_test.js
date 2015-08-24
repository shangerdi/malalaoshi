Template.scheduleWeeklyForOrderTest.onCreated(function(){
  Session.set('errors','');
});
Template.scheduleWeeklyForOrderTest.helpers({
  errorMessage: function(field) {
    return Session.get('errors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('errors')[field] ? 'has-error' : '';
  },
  lessonCounts: function() {
    var tct = TeacherAvailableTimes.findOne({"teacher.id": Template.instance().data.teacherId});
    var availablePhases = (tct && tct.phases)?tct.phases:null;
    return availablePhases?availablePhases.length:0;
  }
});
Template.scheduleWeeklyForOrderTest.events({
  'click td.phase': function(e) {
    var ele=e.target, $ele = $(ele);
    if ($ele.hasClass("available") && !$ele.hasClass('reserved')) {
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
      $this = $(this);
      if ($this.hasClass('reserved')) {
        return;
      }
      i = $this.data('weekday'), start = $this.data('start'), end = $this.data('end');
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
    var teacherId = Template.instance().data.teacherId;
    Meteor.call('reserveCourses', {'teacherId':teacherId, 'lessonCount':lessonCount, 'phases':phases}, function(err, result) {
      if(err){
        errors.lessonCount=err.reason;
        Session.set('errors', errors);
        $(e.currentTarget).removeClass("disabled");
        return throwError(err.reason);
      }
      alert("约课成功");
      $(e.currentTarget).removeClass("disabled");
      $("td.phase.chosen").removeClass("chosen");
    });
  }
});
