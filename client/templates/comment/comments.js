var navMoveHeight = 0;
var defalutIncrement = 1;
var sort = {createdAt: -1};
var commentsLimit = defalutIncrement;
Template.comments.onCreated(function(){
  var self = this;
  this.loadMoreComments = new ReactiveVar();
  this.commentsCount = new ReactiveVar(0);
  this.commentsData = new ReactiveVar();

  self.autorun(function(){
    commentsCount = 0;
    var loadMoreComments = self.loadMoreComments.get();
    var params = {
      teacherId: self.data.teacher ? self.data.teacher._id : null,
      options: {
        sort: sort,
        limit: commentsLimit
      }
    };
    Template.currentData().commentsParams = params;
    var currentData = Template.currentData();

    var commentsType = Session.get('commentsPageAcitveTab');
    if(!commentsType){
      commentsType = "goodComments";
      Session.set('commentsPageAcitveTab', "goodComments");
    }
    if(currentData.teacher && currentData.teacher._id){
      if(commentsType == 'goodCommnets'){
        currentData.commentsSub = Meteor.subscribe('goodComments', params, {
          onReady: function(ready){
            self.commentsData.set(Math.random());
          }
        });
      }else if(commentsType == 'averageComments'){
        currentData.commentsSub = Meteor.subscribe('averageComments', params, {
          onReady: function(ready){
            self.commentsData.set(Math.random());
          }
        });
      }else if(commentsType == 'poolComments'){
        currentData.commentsSub = Meteor.subscribe('poolComments', params, {
          onReady: function(ready){
            self.commentsData.set(Math.random());
          }
        });
      }
    }
  });
});
Template.comments.onRendered(function(){
  var self = this;

  var addNavElement = '' +
  '  <div class="comments-nav-tatic nav-fixed-top" id="commentsNavStatic"> ' +
  '    <div id="goodCommnets" class="comments-page-tab">好评(25)</div> ' +
  '    <div id="averageComments" class="comments-page-tab">中评(0)</div> ' +
  '    <div id="poolComments" class="comments-page-tab">差评(1)</div> ' +
  '  </div> ';

  $('body').append(addNavElement);
  $('#poolComments').html($('#poolCommentsInScroll').html());
  $('#averageComments').html($('#averageCommentsInScroll').html());
  $('#poolComments').html($('#poolCommentsInScroll').html());

  commentsPageAcitveTabClick('goodCommnets');
  $('#goodCommnets').click(function(){
    commentsPageAcitveTabClick('goodCommnets');
  });
  $('#averageComments').click(function(){
    commentsPageAcitveTabClick('averageComments');
  });
  $('#poolComments').click(function(){
    commentsPageAcitveTabClick('poolComments');
  });

  self.autorun(function(){
    var actId = Session.get('commentsPageAcitveTab');
    if(actId == "goodCommnets"){
      $('#averageComments').removeClass('teacher-detail-tab-active');
      $('#poolComments').removeClass('teacher-detail-tab-active');
      $('#goodCommnets').addClass('teacher-detail-tab-active');

      $('#averageCommentsInScroll').removeClass('teacher-detail-tab-active');
      $('#poolCommentsInScroll').removeClass('teacher-detail-tab-active');
      $('#goodCommnetsInScroll').addClass('teacher-detail-tab-active');
    }else if(actId == "averageComments"){
      $('#goodCommnets').removeClass('teacher-detail-tab-active');
      $('#poolComments').removeClass('teacher-detail-tab-active');
      $('#averageComments').addClass('teacher-detail-tab-active');

      $('#goodCommnetsInScroll').removeClass('teacher-detail-tab-active');
      $('#poolCommentsInScroll').removeClass('teacher-detail-tab-active');
      $('#averageCommentsInScroll').addClass('teacher-detail-tab-active');
    }else if(actId == "poolComments"){
      $('#goodCommnets').removeClass('teacher-detail-tab-active');
      $('#averageComments').removeClass('teacher-detail-tab-active');
      $('#poolComments').addClass('teacher-detail-tab-active');

      $('#goodCommnetsInScroll').removeClass('teacher-detail-tab-active');
      $('#averageCommentsInScroll').removeClass('teacher-detail-tab-active');
      $('#poolCommentsInScroll').addClass('teacher-detail-tab-active');
    }
  });

  var detailScrollTop = $('.view-page-common').scrollTop();
  var commentsDetailOffTop = $(".view-page-common").offset().top;
  var barHeaderHeight = $(".bar-header").outerHeight(true);
  var navStaticHeight = $("#commentsNavStatic").outerHeight(true);
  navMoveHeight = detailScrollTop + $("#commentsNav").offset().top + 2 - barHeaderHeight;
  $('.view-page-common').scroll(function(){
    if($("#commentsNav").offset().top <= commentsDetailOffTop){
      $('#commentsNavStatic').css('display','block');
    }else{
      $('#commentsNavStatic').css('display','none');
    }
  });

});
Template.comments.helpers({
  commentStars: function(){
    return genScoreStarsAry(cmpTotalScore(this.teacher), 5);
  },
  totalComments: function(){
    var maCount = this.teacher.profile.maCount;
    var laCount = this.teacher.profile.laCount;
    maCount = _.isNumber(maCount) ? maCount : 0;
    laCount = _.isNumber(laCount) ? laCount : 0;
    return maCount + laCount;
  },
  starClass: function(val){
    return val == 3 ? "ion-ios-star" : val == 2 ? "ion-ios-star-half" : val == 1 ? "ion-ios-star-outline" : "";
  },
  maScore: function(){
    var maScore = this.teacher.profile.maScore;
    var maCount = this.teacher.profile.maCount;
    maScore = _.isNumber(maScore) ? maScore : 0;
    maCount = _.isNumber(maCount) ? maCount : 0;
    return accounting.formatNumber(maCount == 0 ? 0 : maScore/maCount, 1);
  },
  laScore: function(){
    var laScore = this.teacher.profile.laScore;
    var laCount = this.teacher.profile.laCount;
    laScore = _.isNumber(laScore) ? laScore : 0;
    laCount = _.isNumber(laCount) ? laCount : 0;
    return accounting.formatNumber(laCount == 0 ? 0 : laScore/laCount, 1);
  },
  activeTabClass: function(id){
    var actId = Session.get('commentsPageAcitveTab');
    if(actId == id){
      return "teacher-detail-tab-active";
    }
    return "";
  },
  goodComments: function(){
    var ct = this.userSummary && this.userSummary.goodComments ? this.userSummary.goodComments : 0
    $('#goodCommnets').html('好评(' + ct + ')');
    return ct;
  },
  averageComments: function(){
    var ct = this.userSummary && this.userSummary.averageComments ? this.userSummary.averageComments : 0;
    $('#averageComments').html('中评(' + ct + ')');
    return ct;
  },
  poolComments: function(){
    var ct = this.userSummary && this.userSummary.poolComments ? this.userSummary.poolComments : 0;
    $('#poolComments').html('差评(' + ct + ')');
    return ct;
  },
  unitCost: function(){
    return this.teacherAudit && this.teacherAudit.price ? this.teacherAudit.price : 0;
  },
  allComments: function(){
    Template.instance().commentsData.get();
    var currentData = Template.currentData();
    if(this.commentsSub && this.commentsSub.ready() && this.commentsParams){
      var all = Comment.find({'teacher.id': this.commentsParams.teacherId}, this.commentsParams.options);
      Template.instance().commentsCount.set(all.count());
      return all;
    }
    return [];
  },
  totalScore: function(){
    return accounting.formatNumber(cmpTotalScore(this.teacher), 1);
  },
  commentsReady: function(){
    Template.instance().commentsData.get();
    var commentsCount = Template.instance().commentsCount.get();
    var dt = Template.currentData();
    if(dt && dt.commentsSub){
      return dt.commentsSub.ready();
    }else{
      return false;
    }
  },
  hasMore: function(){
    var allCount = 0;
    Template.instance().loadMoreComments.get();
    var commentsType = Session.get('commentsPageAcitveTab');
    var currentData = Template.currentData();
    if(currentData.teacher && currentData.teacher._id){
      if(commentsType == 'goodCommnets'){
        allCount = this.userSummary && this.userSummary.goodComments ? this.userSummary.goodComments : 0
      }else if(commentsType == 'averageComments'){
        allCount = this.userSummary && this.userSummary.averageComments ? this.userSummary.averageComments : 0;
      }else if(commentsType == 'poolComments'){
        allCount = this.userSummary && this.userSummary.poolComments ? this.userSummary.poolComments : 0;
      }
    }
    var collectionCount = Template.instance().commentsCount.get();
    return collectionCount >= allCount ? false : commentsLimit <= collectionCount;
  }
});
Template.commentsDetailShow.helpers({
  userAvt: function(){
    if(this.comment && this.comment.student && this.comment.student.id){
      var user = Meteor.users.findOne({"_id": this.comment.student.id});
      return user && user.profile && user.profile.avatarUrl ? user.profile.avatarUrl : "";
    }
    return "";
  },
  commentStars: function(){
    var maScore = this.comment.maScore;
    var laScore = this.comment.laScore;
    maScore = _.isNumber(maScore) ? maScore : 0;
    laScore = _.isNumber(laScore) ? laScore : 0;
    return genScoreStarsAry((maScore + laScore)/2, 5);
  },
  starClass: function(val){
    return val == 3 ? "ion-ios-star" : val == 2 ? "ion-ios-star-half" : val == 1 ? "ion-ios-star-outline" : "";
  },
  createDate: function(){
    return this.comment ? moment(this.comment.createdAt).format('YYYY年MM月DD日') : "";
  },
  subject: function(){
    var school = "", subject = "";
    if(this.comment && this.comment.teacher && this.comment.teacher.id){
      var teacher = Meteor.users.findOne({"_id": this.comment.teacher.id});
      if(teacher && teacher.profile && teacher.profile.subjects){
        var subjects = teacher.profile.subjects[0];
        if(subjects){
          if(subjects.subject){
            subject = getEduSubjectText(subjects.subject);
          }
          if(subjects.school){
            school = getEduSchoolText(subjects.school);
          }
        }
      }
    }
    return school + subject;
  }
});
Template.comments.events({
  'click .comments-page-tab': function(e){
    e.preventDefault();
    commentsPageAcitveTabClick(e.target.id.toString().replace("InScroll", ""));
  },
  'click .load-more': function(e){
    e.preventDefault();
    commentsLimit += defalutIncrement;
    Template.instance().loadMoreComments.set(Math.random);
  }
});
Template.comments.onDestroyed(function(){
  $('#commentsNavStatic').remove();
});
var commentsPageAcitveTabClick = function(id){
  commentsLimit = defalutIncrement;
  Session.set('commentsPageAcitveTab', id);
  if($('.view-page-common').scrollTop() != navMoveHeight){
    $('.view-page-common').scrollTo(navMoveHeight+'px',500);
  }
}
function cmpTotalScore(teacher){
  var maScore = teacher.profile.maScore;
  var maCount = teacher.profile.maCount;
  var laScore = teacher.profile.laScore;
  var laCount = teacher.profile.laCount;
  maScore = _.isNumber(maScore) ? maScore : 0;
  maCount = _.isNumber(maCount) ? maCount : 0;
  laScore = _.isNumber(laScore) ? laScore : 0;
  laCount = _.isNumber(laCount) ? laCount : 0;
  return (maCount + laCount) == 0 ? 0 : (maScore + laScore)/(maCount + laCount);
}
