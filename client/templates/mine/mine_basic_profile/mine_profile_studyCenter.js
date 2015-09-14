Template.mineProfileStudyCenter.onCreated(function(){
  var studyCenterIds = Meteor.user().profile.studyCenter;
  if (studyCenterIds) {
    Meteor.subscribe('studyCenters', {'find':{'_id':{$in: studyCenterIds}}});
  }
});
Template.mineProfileStudyCenter.helpers({
  studyCenterList: function() {
    var studyCenterIds = Meteor.user().profile.studyCenter;
    if (studyCenterIds) {
      return StudyCenter.find({'_id': {$in: studyCenterIds}});
    }
  }
});
