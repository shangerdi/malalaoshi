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
function doStarLevelAry(self){
  var ary = [];
  if(self.profile && self.profile.starLevel){
    for(var i=0; i<self.profile.starLevel; i++){
      ary[i] = 0;
    }
  }
  return ary;
}
function doPrice(self){
  return accounting.formatNumber(self.profile.price, 0);
}
Template.teacherItem.helpers({
  subject: function(){
    return doSubject(this);
  },
  starLevelAry: function(){
    return doStarLevelAry(this);
  },
  price: function(){
    return doPrice(this);
  }
});
Template.teacherItemRecommend.helpers({
  subject: function(){
    return doSubject(this);
  },
  starLevelAry: function(){
    return doStarLevelAry(this);
  },
  price: function(){
    return doPrice(this);
  }
});
