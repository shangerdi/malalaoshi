var showToastInfo = function(msg) {
  var width=150, height=50, viewHeight = $(window).height(), viewWidth = $(window).width();
  var html = '<div class="toast-box" style="position: fixed;top:'+(viewHeight-height)/2+'px;left:'+(viewWidth-width)/2+'px;'
    +'width: '+width+'px;height: '+height+'px;line-height: '+height+'px;padding: 0 10px;'
    +'background: rgba(0,0,0,0.8);color: #eee;text-align: center;z-index: 999999;">'
    + msg
    + '</div>';
  $('.toast-box').remove();
  $(document.body).append(html);
  setTimeout(function() {
    $('.toast-box').remove();
  }, 800);
}
Template.studentScheduleCourses.onRendered(function(){
  Session.set('ionTab.current', this.data.tab);
});
Template.studentScheduleCourses.helpers({
  getCourseTime: function(timestamp) {
    return moment(timestamp).format('YYYY年MM月DD日');
  },
  getAvatarUrl: function(userId) {
    var user = Meteor.users.findOne(userId);
    if (user && user.profile) {
      return user.profile.avatarUrl;
    }
  },
  isCommented: function(course) {
    return course.state == ScheduleTable.attendanceStateDict["commented"].value;
  },
  commentStars: function(course){
    var comment = Comments.findOne({'courseAttendanceId': course._id});
    if (!comment) {
      return null;
    }
    var maScore = comment.maScore;
    var laScore = comment.laScore;
    maScore = _.isNumber(maScore) ? maScore : 0;
    laScore = _.isNumber(laScore) ? laScore : 0;
    return genScoreStarsAry((maScore + laScore)/2, 5);
  },
  starImage: function(val){
    return val == 3 ? "star_h.png" : val == 2 ? "star_half.png" : val == 1 ? "star_normal.png" : "";
  }
});
Template.studentScheduleCourses.events({
  'click .btn-confirm': function(e) {
    var ele=e.target, $ele=$(ele);
    var itemId = $ele.closest('div').data('itemid');
    IonPopup.confirm({
      title: '',
      template: '是否确认课时？',
      cancelText: '否',
      okText: '是',
      onOk: function() {
        Meteor.call('confirmCourseAttended', itemId, function(err, result){
          if (err) {
            showToastInfo("出错了，请稍后重试");
            return;
          }
          showToastInfo("已确认");
        });
      },
      onCancel: function() {
      }
    });
  },
  'click .btn-comment': function(e) {
    var ele=e.target, $ele=$(ele);
    var itemId = $ele.closest('div').data('itemid');
    Router.go('comment', {'cid': itemId});
  }
});
