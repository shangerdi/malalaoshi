Template.mineProfileStudyCenter.onCreated(function(){
  var studyCenterIds = Meteor.user().profile.studyCenters;
  if (studyCenterIds) {
    Meteor.subscribe('studyCenters', {'find':{'_id':{$in: studyCenterIds}}});
  }
});
Template.mineProfileStudyCenter.helpers({
  studyCenterList: function() {
    var studyCenterIds = Meteor.user().profile.studyCenters;
    if (studyCenterIds && studyCenterList.length) {
      return StudyCenters.find({'_id': {$in: studyCenterIds}});
    }
  }
});
