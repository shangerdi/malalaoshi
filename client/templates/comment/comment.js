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
Template.comment.helpers({
  subject: function(){
    return doSubject(this.teacher);
  },
  unitCost: function(){
    return accounting.formatNumber(this.teacher.profile.unitCost, 0);
  }
});
