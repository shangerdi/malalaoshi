Template.teacher.helpers({
  genderFemale: function(v){
    if(this.user.profile && this.user.profile.gender == '女'){
      return true;
    }
    return false;
  },
  genderMale: function(){
    if(this.user && this.user.profile && this.user.profile.gender == '男'){
      return true;
    }
    return false;
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
    if(this.user && this.user.status && this.user.status.edu == "approved"){
      return true;
    }
    return false;
  },
  cert: function(){
    if(this.user && this.user.status && this.user.status.cert == "approved"){
      return true;
    }
    return false;
  }
});

Template.teacher.events({
  'click #submitBtnTiYan': function(e) {
    e.preventDefault();
    var curForm = e.target;
    alert("clikc");
  }
});
