Template.profileEditEdu.onCreated(function() {
  Session.set('settingsErrors', {});
});
Template.profileEditEdu.helpers({
  errorMessage: function(field) {
    return Session.get('settingsErrors')[field];
  },
  errorClass: function (field) {
    return !!Session.get('settingsErrors')[field] ? 'has-error' : '';
  }
});
Template.profileEditEdu.events({
  'click .btn-add-edu-item': function(e) {
    $profileEduItem = $(".profile-edu-item").first().clone();
    $profileEduItem.find("input").val("");
    $profileEduItem.find("select").val("");
    $profileEduItem.find('.form-group').removeClass('has-error');
    $profileEduItem.find('.help-block').text('');
    $(".profile-edu-items").append($profileEduItem);
  },
  'click .btn-save-edu': function (e) {
    var hasError;
    var showError = function(prop, msg) {
      var $formGroup = prop.closest('.form-group');
      $formGroup.addClass('has-error');
      $formGroup.find('.help-block').text(msg);
    };
    // init state
    $(".profile-edu-items").find('.form-group').removeClass('has-error');
    $(".profile-edu-items").find('.help-block').text('');
    // check error
    $(".profile-edu-item").each(function(){
      $item = $(this);
      var prop = $item.find("select[name=degree]");
      if (prop.val()=="") {
        hasError = true;
        showError(prop, "请选择学历");
      }
      prop = $item.find("input[name=college]");
      if (prop.val()=="") {
        hasError = true;
        showError(prop, "请填写学校名字");
      }
      prop = $item.find("input[name=major]");
      if (prop.val()=="") {
        hasError = true;
        showError(prop, "请填写专业");
      }
    });
    if (hasError) {
      return false;
    }
    // collect data
    var eduItems = [];
    $(".profile-edu-item").each(function(){
      $item = $(this);
      var degree = $item.find("select[name=degree]").val();
      var college = $item.find("input[name=college]").val();
      var major = $item.find("input[name=major]").val();
      eduItems.push({'degree':degree, 'college':college, 'major':major})
    });
    console.log(eduItems);
    // do save
    
  }
});