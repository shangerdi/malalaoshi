Template.columnEdit.onCreated(function() {
  var curUser = Meteor.user();
  if (!curUser || !(curUser.role === 'admin')){
      throw new Meteor.Error('权限不足', "当前用户权限不足");
  }
  Session.set('columnEditErrors', {});
});

Template.columnEdit.rendered=function(){
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

Template.columnEdit.events({
  'submit form': function(e) {
    e.preventDefault();
    var curForm = e.target;
    var column = {
      editorTextArea: CKEDITOR.instances.editorTextArea.getData(),
      columnName: $(curForm).find('[name=columnName]').val(),
      columnId: $(curForm).find('[name=columnId]').val()
    }

    var errors = validateColumn(column);
    if (errors.hasError) {
      return Session.set('columnEditErrors', errors);
    }

    Meteor.call('updateColumn', column, function(error, result) {
      if (error)
        return throwError(error.reason);

      Router.go('/column/'+result);
    });
  }
});

Template.columnEdit.helpers({
  errorMessage: function(field) {
    return Session.get('columnEditErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('columnEditErrors')[field] ? 'has-error' : '';
  }
});