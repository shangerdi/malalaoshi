Template.adminPage.onCreated(function() {
  var curUser = Meteor.user();
  if (!curUser || !(curUser.role === 'admin')){
      throw new Meteor.Error('权限不足', "当前用户权限不足");
  }
  Session.set('adminPageErrors', {});
});

Template.adminPage.rendered=function(){
  var template=this;
  window.CKEDITOR_BASEPATH = "/ckeditor/";

  $.when(
    $.getScript("/ckeditor/ckeditor.js")
  ).done(function(){
    CKEDITOR.replace('content');
  }).fail(function(e){
    if (console) {
      console.log(e);
    }
  });
};

Template.adminPage.events({
  'submit form': function(e) {
    e.preventDefault();
    var curForm = e.target;
    var page = {
      content: CKEDITOR.instances.content.getData(),
      title: $(curForm).find('[name=title]').val(),
      name: $(curForm).find('[name=name]').val()
    }

    Meteor.call('updatePage', page, function(error, result) {
      if (error)
        return throwError(error.reason);

      Router.go(result);
    });
  }
});

Template.adminPage.helpers({
  errorMessage: function(field) {
    return Session.get('adminPageErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('adminPageErrors')[field] ? 'has-error' : '';
  }
});
