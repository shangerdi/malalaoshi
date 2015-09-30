var getTeacherId = function() {
  return Session.get("orderTeacherId");
}
var getUnitPrice = function() {
  return Orders.getTeacherUnitPrice(getTeacherId());
}
var getCourseCount = function() {
  var courseCount = parseInt($("#courseCount").val());
  if (isNaN(courseCount) || courseCount<0 ) {
    courseCount = 0;
    $("#courseCount").val(courseCount);
  }
  return courseCount;
}
var calcTotalCost = function() {
  var courseCount = getCourseCount();
  $("#totalCost").text(courseCount * getUnitPrice());
}
Template.orderStepSchedule.onCreated(function(){
  Session.set('errors','');
});
Template.orderStepSchedule.onRendered(function(){
  // 从session中获取“课时数”并显示
  var num = parseInt(Session.get("courseCount"));;
  if (isNaN(num) || num<0) {
    num = 0;
  }
  $("#courseCount").val(num);
  calcTotalCost();
  // 从seesion中获取已选择的“时间段”
  var phases = Session.get("phases");
  if (_.isArray(phases)) {
    $("td.phase").each(function(){
      $this = $(this);
      if (!$this.hasClass('available')) {
        return;
      }
      var i = $this.data('weekday'), start = $this.data('start'), end = $this.data('end');
      var flag = _.find(phases,function(obj) {
        return obj.weekday==i && obj.start==start && obj.end==end;
      });
      if (flag) {
        $this.addClass('chosen');
      }
    });
  }
});
Template.orderStepSchedule.helpers({
  errorMessage: function(field) {
    return Session.get('errors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('errors')[field] ? 'has-error' : '';
  },
  'teacherId': function() {
    return Session.get("orderTeacherId");
  },
  'unitPrice': function() {
    return getUnitPrice();
  }
});
Template.orderStepSchedule.events({
  'click #nextStep': function(e) {
    var courseCount = getCourseCount()
      , errors={hasError:false};
    if (courseCount<1) {
      errors.courseCount="课时数不能小于1";
      errors.hasError=true;
    }
    var phases = [];
    $("td.phase.chosen").each(function(){
      $this = $(this);
      if (!$this.hasClass('available')) {
        return;
      }
      i = $this.data('weekday'), start = $this.data('start'), end = $this.data('end');
      phases.push({weekday:i, start:start, end:end})
    });
    if(phases.length==0) {
      errors.phases="请点击上面方格选择时间段";
      errors.hasError=true;
    }
    Session.set('errors', errors);
    if (errors.hasError) {
      return;
    }
    Session.set("courseCount", courseCount);
    Session.set("phases", phases);
    // 检测课程是否冲突
    var params = {'courseCount': courseCount, 'phases': phases, 'teacherId': getTeacherId()}
    Meteor.call('checkConflictCourseSchedule', params, function(err, result){
      if (err) {
        errors.phases="请求失败，请稍后重试！";
        Session.set('errors', errors);
        return;
      }
      if (result && result.teacher) {
        errors.phases="您选择的上课时间和别人冲突了，请选择其他时间段！";
        Session.set('errors', errors);
        return;
      }
      if (result && result.own) {
        IonPopup.confirm({
          title: '确认课时',
          template: '您已经在相同的时间段预约了课程，是否继续？',
          cancelText: '取消',
          okText: '继续购买',
          onOk: function() {
            Router.go('order');
          },
          onCancel: function() {
          }
        });
        return;
      }
      // 没有任何冲突
      Router.go('order');
    });
  },
  'keyup #courseCount, change #courseCount': function(e) {
    calcTotalCost();
  },
  'click .count-edit-box a': function(e) {
    var ele=e.target, $ele = $(ele);
    var courseCount = getCourseCount();
    if ($ele.hasClass('add')) {
      courseCount++;
    } else {
      courseCount--;
      if (courseCount<0) {
        courseCount = 0;
      }
    }
    $("#courseCount").val(courseCount);
    calcTotalCost();
  },
  'click td.phase': function(e) {
    var ele=e.target, $ele = $(ele);
    if ($ele.hasClass("available") && !$ele.hasClass('reserved')) {
      $ele.toggleClass("chosen");
    }
    var nChosen = $('td.phase.chosen').length;
    $('#courseCount').val(Math.max($('#courseCount').val(), nChosen));
    calcTotalCost();
  }
});
