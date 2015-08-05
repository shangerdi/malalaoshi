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
var maxEduItems = 2;
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
      if ($('.profile-edu-item:visible').length<maxEduItems) {
        $('.btn-add-edu-item').show();
      }
    });
    $profileEduItem.addClass('man-insert');
    $(".profile-edu-items").append($profileEduItem);
    if ($('.profile-edu-item:visible').length>=maxEduItems) {
      $(e.target).hide();
    }
  },
  'click .btn-save-edu': function (e) {
    var hasError;
    var showError = function(prop, msg) {
      if (prop.is('.profile-edu-item')) {
        $formGroup = prop;
      } else {
        $formGroup = prop.closest('.form-group');
      }
      $formGroup.addClass('has-error');
      $formGroup.find('.help-block').text(msg);
    };
    // init state
    $(".profile-edu-items").find('.form-group').removeClass('has-error');
    $(".profile-edu-items").find('.help-block').text('');
    // check error, collect data
    var eduItems = [];
    $(".profile-edu-item").each(function(){
      $item = $(this);
      if (!$item.is(":visible")) {
        return;
      }
      var err = false;
      var prop = $item.find("select[name=degree]");
      var degree = prop.val();
      if (degree=="") {
        err = true;
        showError(prop, "请选择学历");
      }
      prop = $item.find("input[name=college]");
      var college = prop.val();
      if (college=="") {
        err = true;
        showError(prop, "请填写学校名字");
      } else {
        if (college.length>12) {
          err = true;
          showError(prop, "学校名字不能超过12个字");
        }
      }
      prop = $item.find("input[name=major]");
      var major = prop.val();
      if (major=="") {
        err = true;
        showError(prop, "请填写专业");
      } else {
        if (major.length>12) {
          err = true;
          showError(prop, "专业名字不能超过12个字");
        }
      }
      if (err) {
        hasError = true;
        return;
      }
      _.each(eduItems, function(ele){
        if (ele.degree==degree && ele.college==college && ele.major==major) {
          err = true;
          showError($item, "与前面的重复了，请确认");
        }
      });
      if (err) {
        hasError = true;
        return;
      }
      eduItems.push({'degree':degree, 'college':college, 'major':major})
    });
    if (hasError) {
      return false;
    }
    // do save
    Meteor.call('updateEducation', eduItems, function(error, result) {
      if (error)
        return throwError(error.reason);

      Router.go('profileEditCert');
      $(".profile-edu-item.man-insert").remove();
      $(".profile-edu-item.man-delete").show();
    });
  }
});
Template.eduItem.events({
  'click .btn-delete-item': function(e) {
    $profileEduItem = $(e.target).closest(".profile-edu-item");
    $profileEduItem.addClass('man-delete');
    $profileEduItem.hide();
    if ($('.profile-edu-item:visible').length<maxEduItems) {
      $('.btn-add-edu-item').show();
    }
  }
});
