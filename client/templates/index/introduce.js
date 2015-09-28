Template.introduce.onRendered(function(){
  IonNavigation.skipTransitions = true;
  if(!Session.get('ionTab.current') || (Session.get('ionTab.current') != 'intTeacher' && Session.get('ionTab.current') != 'intPlatform')){
    Session.set('ionTab.current', "intTeacher");
  }
});
Template.introduce.helpers({
  isIntTeacherTab: function(){
    return Session.get('ionTab.current') == 'intTeacher';
  }
});
