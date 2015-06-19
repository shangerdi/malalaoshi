Template.profileEditEdu.helpers({
  eduInfo: function () {
    return UserEducation.findOne({userId: Meteor.userId()});
  },
  eduItems: function () {
    var eduInfo = UserEducation.findOne({userId: Meteor.userId()});
    if (!eduInfo || !eduInfo.eduItems) {
      return [];
    }
    return eduInfo.eduItems;
  },
  eduItemsEmpty: function () {
    var eduInfo = UserEducation.findOne({userId: Meteor.userId()});
    if (!eduInfo || !eduInfo.eduItems || eduInfo.eduItems.length==0) {
      return true;
    }
    return false;
  }
});
Template.profileEditEdu.events({
  'click .btn-add-edu-item': function(e) {
    $profileEduItem = $(".profile-edu-item").last().clone();
    $profileEduItem.show();
    $profileEduItem.find("input").val("");
    $profileEduItem.find("select").val("");
    $profileEduItem.find('.form-group').removeClass('has-error');
    $profileEduItem.find('.help-block').text('');
    $profileEduItem.find('.btn-delete-item').click(function(e) {
      $item = $(e.target).closest(".profile-edu-item");
      $item.addClass('man-delete');
      $item.hide();
    });
    $profileEduItem.addClass('man-insert');
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
      if (!$item.is(":visible")) {
        return;
      }
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
      if (!$item.is(":visible")) {
        return;
      }
      var degree = $item.find("select[name=degree]").val();
      var college = $item.find("input[name=college]").val();
      var major = $item.find("input[name=major]").val();
      eduItems.push({'degree':degree, 'college':college, 'major':major})
    });
    console.log(eduItems);
    // do save
    Meteor.call('updateEducation', eduItems, function(error, result) {
      if (error)
        return throwError(error.reason);
      alert("保存成功");
      $(".profile-edu-item.man-insert").remove();
      $(".profile-edu-item.man-delete").show();
    });
  }
});
Template.eduItem.onRendered(function() {
  if (this.data && this.data.degree)
    this.$("select[name=degree]").val(this.data.degree);
});
Template.eduItem.events({
  'click .btn-delete-item': function(e) {
    $profileEduItem = $(e.target).closest(".profile-edu-item");
    $profileEduItem.addClass('man-delete');
    $profileEduItem.hide();
  }
});