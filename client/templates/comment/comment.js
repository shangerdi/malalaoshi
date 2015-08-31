var maxStar = 5;
function doSubject(self){
  var school = "", subject = "";
  if(self.profile && self.profile.subjects){
    var subjects = self.profile.subjects[0];
    if(subjects){
      if(subjects.subject){
        subject = getEduSubjectText(subjects.subject);
      }
      if(subjects.school){
        school = getEduSchoolText(subjects.school);
      }
    }
  }
  return school + subject;
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
  }
  return 0;
}
Template.comment.onRendered(function(){
  Session.set("commentMaDuStars", genStarsAry(-1));
  Session.set("commentLaDuStars", genStarsAry(-1));
});
Template.comment.helpers({
  subject: function(){
    return doSubject(this.teacher);
  },
  unitCost: function(){
    return accounting.formatNumber(this.teacher.profile.unitCost, 0);
  },
  maStars: function(){
    return Session.get("commentMaDuStars");
  },
  laStars: function(){
    return Session.get("commentLaDuStars");
  },
  starClass: function(val){
    return val ? "ion-ios-star" : "ion-ios-star-outline";
  },
  submitBtnClass: function(){
    return (this.courseAttendance && this.courseAttendance.state == 3) ? "buttom-btn-view-no-active" : "buttom-btn-view-active";
  }
});
Template.comment.events({
  'click i[name="maDu"]': function(e){
    e.preventDefault();
    Session.set("commentMaDuStars", genStarsAry(this.index));
  },
  'click i[name="laDu"]': function(e){
    e.preventDefault();
    Session.set("commentLaDuStars", genStarsAry(this.index));
  },
  'click .buttom-btn-view .button': function(e){
    e.preventDefault();
    if($('.buttom-btn-view').hasClass("buttom-btn-view-no-active")){
      return;
    }
    var maScore = Session.get("commentMaDuStars");
    var laScore = Session.get("commentLaDuStars");
    var comment = $('textarea').val();
    var saveObj = {
      maScore: getScore(maScore),
      laScore: getScore(laScore),
      courseAttendanceId: this.courseAttendance._id,
      comment: comment
    }
    Meteor.call('insertComment', saveObj, function(error, result){
      if(error){
        return throwError(error.reason);
      }

      IonPopup.show({
          title: false,
          template: '<div class="pop-remind-template">评价成功</div>',
          buttons: []
      });
      $('.buttom-btn-view').removeClass("buttom-btn-view-active");
      $('.buttom-btn-view').addClass("buttom-btn-view-no-active");
      Meteor.setTimeout(function() {
         IonPopup.close();
       }, 700);
     });

  }
});
