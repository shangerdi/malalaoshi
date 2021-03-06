var maxStar = 5;
function doSubject(self){
  var stage = "", subject = "";
  if(self.profile && self.profile.subjects){
    var subjects = self.profile.subjects[0];
    if(subjects){
      if(subjects.subject){
        subject = getEduSubjectText(subjects.subject);
      }
      if(subjects.stage){
        stage = getEduStageText(subjects.stage);
      }
    }
  }
  return stage + subject;
}
function genStarsAry(select){
  var arr = [];
  for(var i=0;i<maxStar;i++){
    arr[i] = {
      index: i,
      value: (i <= select) ? 1 : 0
    };
  }
  return arr;
}
function getScore(arr){
  if(!arr){
    return 0;
  }
  for(var i=0;i<arr.length;i++){
    if(arr[i].value == 0){
      return i;
    }
    if(i == (arr.length - 1)){
      return i+1;
    }
  }
  return 0;
}
Template.comment.onRendered(function(){
  IonNavigation.skipTransitions = true;
  if(this.data && this.data.comment){
    var madu = this.data.comment.maScore;
    var ladu = this.data.comment.laScore;
    madu = madu > 0 ? --madu : -1;
    ladu = ladu > 0 ? --ladu : -1;
    Session.set("commentMaDuStars", genStarsAry(madu));
    Session.set("commentLaDuStars", genStarsAry(ladu));
  }else{
    Session.set("commentMaDuStars", genStarsAry(-1));
    Session.set("commentLaDuStars", genStarsAry(-1));
  }
});
Template.comment.helpers({
  subject: function(){
    return doSubject(this.teacher);
  },
  price: function(){
    return accounting.formatNumber(this.teacher.profile.price, 0);
  },
  maStars: function(){
    return Session.get("commentMaDuStars");
  },
  laStars: function(){
    return Session.get("commentLaDuStars");
  },
  starImageMa: function(val){
    return val ? "evaluate_icon_hemp_highlight.png" : "evaluate_icon_hemp_normal.png";
  },
  starImageLa: function(val){
    return val ? "evaluate_icon_spicy_highlight.png" : "evaluate_icon_spicy_normal.png";
  },
  commented: function(){
    return this.courseAttendance && this.courseAttendance.state == 3;
  },
  commentInfo: function(){
    return this.comment && this.comment.comment ? this.comment.comment : "";
  },
  readOnly: function(){
    return (this.courseAttendance && this.courseAttendance.state == 3) ? "readOnly" : "";
  }
});
Template.comment.events({
  'focus textarea': function(e) {
    $('.content').animate({
      scrollTop: $('textarea').offset().top
    }, 500);
  },
  'click img[name="maDu"]': function(e){
    e.preventDefault();
    var dt = Template.instance().data;
    if(dt.courseAttendance && dt.courseAttendance.state == 3){
      return;
    }
    Session.set("commentMaDuStars", genStarsAry(this.index));
  },
  'click img[name="laDu"]': function(e){
    e.preventDefault();
    var dt = Template.instance().data;
    if(dt.courseAttendance && dt.courseAttendance.state == 3){
      return;
    }
    Session.set("commentLaDuStars", genStarsAry(this.index));
  },
  'click .bottom-btn-view button': function(e){
    e.preventDefault();
    var maScore = Session.get("commentMaDuStars");
    var laScore = Session.get("commentLaDuStars");
    var comment = $('textarea').val();
    var saveObj = {
      maScore: getScore(maScore),
      laScore: getScore(laScore),
      courseAttendanceId: this.courseAttendance._id,
      comment: comment,
      teacher: this.courseAttendance.teacher,
      student: this.courseAttendance.student
    }
    Meteor.call('insertComment', saveObj, function(error, result){
      if(error){
        return throwError(error.reason);
      }

      $('.bottom-btn-view').remove();
      popupInfo(saveObj.courseAttendanceId);
     });
  }
});

function popupInfo(courseAttendanceId){
  IonPopup.show({
    title: null,
    templateName: 'commentSuccessPop',
    buttons: []
  });
  $('#closePop').on('click', function(){
    IonPopup.close();
  });
  $('#getCoupon').on('click', function(){
    IonPopup.close();
    Router.go('raffle', {'cid': courseAttendanceId});
  });
  $('#backToConfirm').on('click', function(){
    IonPopup.close();
    Router.go('coursesConfirmed');
  });
}
