Template.teacher.onRendered(function () {
  IonNavigation.skipTransitions = true;
});
Template.teacher.helpers({
  starLevelAry: function(){
    return doStarLevelAry(this.user);
  },
  genderFemale: function(v){
    return this.user.profile && this.user.profile.gender == '女';
  },
  genderMale: function(){
    return this.user && this.user.profile && this.user.profile.gender == '男';
  },
  subject: function(){
    var school = "", subject = "";
    var retStr = "";
    if(this.user && this.user.profile && this.user.profile.subjects){
      var subjects = this.user.profile.subjects;
      for(var i=0; i<subjects.length;i++){
        var subject = subjects[i];
        if(i != 0){
          retStr += " | ";
        }
        if(subject.school){
          retStr += getEduSchoolText(subject.school);
        }
        if(subject.subject){
          retStr += getEduSubjectText(subject.subject);
        }
      }
    }
    return retStr;
  },
  colleges: function(){
    var ret = [];
    if(this.userEdu && this.userEdu.eduItems){
      var edus = this.userEdu.eduItems;
      _.each(edus, function(item) {
        ret[ret.length] = item.college + " | " + getEduDegreeText(item.degree);
      });
    }
    return ret;
  },
  eduAudit: function(){
    return this.user && this.user.status && this.user.status.edu == "approved";
  },
  cert: function(){
    return this.user && this.user.status && this.user.status.cert == "approved";
  },
  submitActiv: function(){
    return !this.user;
  },
  activeTabClass: function(id){
    var actId = Session.get('teacherDetialPageAcitveTab');
    if(actId == id){
      return "teacher-detail-tab-active";
    }
    return "";
  }
});

Template.teacher.events({
  'click #tryExperienceCourse': function(e) {
    e.preventDefault();

    var user = Meteor.user();
    var teacher = this.user;
    if(!teacher){
      $(e.currentTarget).addClass("disabled");
    }

    var className = "体验课程";
    var hour = "1";
    var unitCost = "1";
    var cost = "1";

    var queryObj = 'userId=' + user._id +
                   '&teacherId=' + teacher._id +
                   '&className=' + className +
                   '&hour=' + hour +
                   '&unitCost=' + unitCost +
                   '&cost=' + cost;

    Router.go('order', {}, {query: queryObj});
  },
  'click #reserveCourse': function(e) {
    Session.set('orderTeacherId', this.user._id);
    Router.go('orderStepSchedule');
  }
});
Template.teacher.events({
  'click #mainPage': function(e){
    e.preventDefault();
    Session.set('teacherDetialPageAcitveTab', "mainPage");
  },
  'click #personInfo': function(e){
    e.preventDefault();
    Session.set('teacherDetialPageAcitveTab', "personInfo");
  },
  'click #evaluation': function(e){
    e.preventDefault();
    Session.set('teacherDetialPageAcitveTab', "evaluation");
  }
});
function doStarLevelAry(self){
  var ary = [];
  if(self.profile && self.profile.starLevel){
    for(var i=0; i<self.profile.starLevel; i++){
      ary[i] = 0;
    }
  }
  if(ary.length < 5){
    for(var i = ary.length; i < 5; i++){
      ary[i] = 1;
    }
  }
  return ary;
}
