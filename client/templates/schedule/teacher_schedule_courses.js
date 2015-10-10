Template.teacherScheduleCourses.onRendered(function(){
  Session.set('ionTab.current', this.data.tab);
});
Template.teacherScheduleCourses.helpers({
  getCourseTime: function(timestamp) {
    return moment(timestamp).format('MM月DD日');
  },
  convMinutes2Str: function(mins) {
    return ScheduleTable.convMinutes2Str(mins);
  },
  getStateStr: function(item) {
    var now = new Date(), nowTime = now.getTime();
    if (nowTime>=item.attendTime && nowTime<item.endTime) {
      return '上课中';
    }
    if (nowTime>=item.endTime) {
      var curState=item.state, stateDict = ScheduleTable.attendanceStateDict;
      if (curState==stateDict["reserved"].value) {
        return '待确认';
      } else if (curState==stateDict['attended'].value) {
        if (item.detail && item.detail.confirmType==1) {
          return '家长确认';
        } else if (item.detail && item.detail.confirmType==2) {
          return '系统确认';
        }
        return '已确认';
      } else if (curState==stateDict['commented'].value) {
        return '已评价';
      }
    }
  },
  isCommented: function(item) {
    return (item && item.state==ScheduleTable.attendanceStateDict['commented'].value);
  },
  commentStars: function(item){
    var comment = Comments.findOne({'courseAttendanceId': item._id});
    if (!comment) return;
    var maScore = _.isNumber(comment.maScore) ? comment.maScore : 0;
    var laScore = _.isNumber(comment.laScore) ? comment.laScore : 0;
    return genScoreStarsAry((maScore + laScore)/2, 5);
  },
  starImage: function(val){
    return val == 3 ? "star_h.png" : val == 2 ? "star_half.png" : val == 1 ? "star_normal.png" : "";
  },
  getCommentTimeStr: function(item) {
    var comment = Comments.findOne({'courseAttendanceId': item._id});
    if (!comment) return;
    return moment(comment.createdAt).format('M月D日 HH:mm');
  },
  getCommentContent: function(item) {
    var comment = Comments.findOne({'courseAttendanceId': item._id});
    if (!comment) return;
    return comment.comment;
  },
  getAvatarUrl: function(userId) {
    var user = Meteor.users.findOne(userId);
    if (user && user.profile) {
      return user.profile.avatarUrl;
    }
  }
});
Template.teacherScheduleCourses.events({
  'click .btn-show-comment': function (e) {
    var ele = e.target, $ele = $(ele), $item = $ele.closest('.item'), $commentBox = $item.find(".comment-box");
    var id = $ele.data('id');
    if (!$commentBox.hasClass('hide')) {
      $commentBox.addClass('hide');
      $ele.text("查看评价");
      return;
    }
    Meteor.subscribe("commentsByCourseAttendanceId", {'find':{'courseAttendanceId': id}}, function(){
      $commentBox.removeClass('hide');
      $ele.text("隐藏评价");
    });
  }
});
