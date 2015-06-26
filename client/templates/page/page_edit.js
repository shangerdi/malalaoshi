Template.pageEdit.onCreated(function() {
  var curUser = Meteor.user();
  if (!curUser || !(curUser.role === 'admin')){
      throw new Meteor.Error('权限不足', "当前用户权限不足");
  }
  Session.set('pageEditErrors', {});
});

Template.pageEdit.rendered=function(){
  var template=this;
  window.CKEDITOR_BASEPATH = "/ckeditor/";

    $.when(
        $.getScript("/ckeditor/ckeditor.js")
    ).done(function(){
        CKEDITOR.replace('editorTextArea');
    }).fail(function(e){
        if (console) {
            console.log("...加载失败");
            console.log(e);
            console.log("..................");
        }
    });
};

Template.pageEdit.events({
  'submit form': function(e) {
    e.preventDefault();
    var curForm = e.target;
    var page = {
      editorTextArea: CKEDITOR.instances.editorTextArea.getData(),
      pageName: $(curForm).find('[name=pageName]').val(),
      pageId: $(curForm).find('[name=pageId]').val()
    }

    var errors = validatePage(page);
    if (errors.hasError) {
      return Session.set('pageEditErrors', errors);
    }

    Meteor.call('updatePage', page, function(error, result) {
      if (error)
        return throwError(error.reason);

      Router.go('/page/'+result);
    });
  }
});

Template.pageEdit.helpers({
  errorMessage: function(field) {
    return Session.get('pageEditErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('pageEditErrors')[field] ? 'has-error' : '';
  }
});