var getUnitPrice = function() {
  return 400;
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
Template.orderCourseSelectTime.onCreated(function(){
  console.log(Session.get("orderTeacherId"));
  Session.set('errors','');
});
Template.orderCourseSelectTime.helpers({
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
Template.orderCourseSelectTime.events({
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
    Session.set("courseCount", courseCount);
    Session.set("phases", phases);
    Router.go('orderCourseConfirm');
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
  }
});
