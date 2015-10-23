var maxCount = 200;
var inputCount = new ReactiveVar(0);
var saveProfileSelfIntro = function(e) {
  var newselfIntro = $("#selfIntro").val();
  if (!newselfIntro) {
    IonPopup.show({
      'template': "内容不能为空",
      'buttons': []
    });
    setTimeout(function () {
      IonPopup.close();
    }, 800);
    return;
  }
  newselfIntro=$.trim(newselfIntro);
  if (maxCount < newselfIntro.length) {
    IonPopup.show({
      'template': "字数太多了",
      'buttons': []
    });
    setTimeout(function () {
      IonPopup.close();
    }, 800);
    return;
  }
  if (newselfIntro!==Meteor.user().profile.selfIntro) {
    Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.selfIntro':newselfIntro}});
  }
  if (Meteor.isCordova) {
    navigator.app && navigator.app.backHistory && navigator.app.backHistory();
  } else {
    history.back();
  }
}
Template.mineProfileSelfIntro.onRendered(function(){
  $("[data-action=save-profile-selfIntro]").click(saveProfileSelfIntro);
  inputCount.set($("#selfIntro").val().length);
});
Template.mineProfileSelfIntro.helpers({
  'leftCount': function() {
    return maxCount - inputCount.get();
  },
  'overflow': function() {
    if (maxCount < inputCount.get()) {
      return 'overflow';
    }
  }
});
Template.mineProfileSelfIntro.events({
  'keyup #selfIntro, change #selfIntro, blur #selfIntro, mousedown #selfIntro, touchend #selfIntro': function(e) {
    inputCount.set($("#selfIntro").val().length);
  },
  'click .ion-ios-close-empty': function(e) {
    $("#selfIntro").val('');
  }
});