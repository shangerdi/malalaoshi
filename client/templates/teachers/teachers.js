Template.teachers.onRendered(function () {
  IonNavigation.skipTransitions = true;
});
Template.teachers.helpers({
  recommendTeachers: function(){
    return Meteor.users.find({"profile.recommend": true});
  },
  normalTeachers: function(){
    this.terms.find = _.extend(this.terms.find, {"profile.recommend":  {$ne: true}});
    return Meteor.users.find(this.terms.find);
  }
});
Template.teacherItem.onCreated(function() {
  this.data.user = Meteor.users.findOne({_id: this.data.userId});
});
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
  return school + " | " + subject;
}
function genCommentStarsVal(self){
  var score = 0;

  if(self.profile){
    var maScore = self.profile.maScore;
    var laScore = self.profile.laScore;
    maScore = _.isNumber(maScore) ? maScore : 0;
    laScore = _.isNumber(laScore) ? laScore : 0;

    var maCount = self.profile.maCount;
    var laCount = self.profile.laCount;
    maCount = _.isNumber(maCount) ? maCount : 0;
    laCount = _.isNumber(laCount) ? laCount : 0;

    score = genScoreStarsAry((maCount + laCount) == 0 ? 0 : (maScore + laScore)/(maCount + laCount), 5);
  }
  return score;
}
function doPrice(self){
  return TeacherAudit.getTeacherUnitPrice(self._id);
  // return accounting.formatNumber(self.profile.price, 0);
}
Template.teacherItem.helpers({
  subject: function(){
    return doSubject(this);
  },
  commentStars: function(){
    return genCommentStarsVal(this);
  },
  starClass: function(val){
    return val == 3 ? "ion-ios-star" : val == 2 ? "ion-ios-star-half" : val == 1 ? "ion-ios-star-outline" : "";
  },
  price: function(){
    return doPrice(this);
  }
});
Template.teacherItemRecommend.helpers({
  subject: function(){
    return doSubject(this);
  },
  commentStars: function(){
    return genCommentStarsVal(this);
  },
  starClass: function(val){
    return val == 3 ? "ion-ios-star" : val == 2 ? "ion-ios-star-half" : val == 1 ? "ion-ios-star-outline" : "";
  },
  price: function(){
    return doPrice(this);
  }
});
