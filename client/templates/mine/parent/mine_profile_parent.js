Template.mineProfileParent.helpers({
  getBirthDayStr: function() {
    var birthday = Meteor.user().profile.birthday;
    if (birthday) {
      var a = birthday.split('-'), year = a[0], month = a[1], day = a[2];
      return moment([year,month-1,day]).format('YYYY年M月D日');
    }
    return '未设置';
  },
  getGradeStr: function() {
    var grade = Meteor.user().profile.grade;
    if (grade) {
      return getEduGradeText(grade);
    }
    return '未设置';
  }
});
Template.mineProfileParent.events({
  'click #teachingLocationItem': function(e) {
    mapCallbackFunction = function() {
      var point = Session.get('locationLngLat');
      var title = Session.get('locationAddress');
      var address = Session.get("locationStreet");
      var newLocation = {'lng': point.lng, 'lat': point.lat, 'title': title, 'address': address};

      if (!_.isEqual(newLocation,Meteor.user().profile.location)) {
        Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.location':newLocation}});
      }
      if (Meteor.isCordova) {
        navigator.app && navigator.app.backHistory && navigator.app.backHistory();
      } else {
        history.back();
      }
    }
    Router.go('map');
  },
  'click #mineProfileAvatar': function(e) {
    if (Meteor.isCordova) {
      appUploadUserAvatarListener(e);
    } else {
      Router.go('mineProfileAvatar');
    }
  },
  'click #mineProfileGender': function(e) {
    IonActionSheet.show({
      titleText: "",
      buttons: [
        { text: '<div class="action-sheet-gender male"><img src="/images/male.png">男</div>' },
        { text: '<div class="action-sheet-gender female"><img src="/images/female.png">女</div>' }
      ],
      destructiveText: false,
      cancelText: '取消',
      cancel: function() {
      },
      buttonClicked: function(index) {
        var gender='';
        if (index==0) {
          gender='男';
        }
        if (index==1) {
          gender='女';
        }
        if (!gender) return true;
        if (gender!==Meteor.user().profile.gender) {
          Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.gender':gender}});
        }
        return true;
      },
      destructiveButtonClicked: function() {
        return true;
      }
    });
  },
  'click #mineProfileBirthday': function(e) {
    IonActionSheetCustom.show('_birthdayActionSheet',{
      finishText: '完成',
      destructiveText: false,
      cancelText: '取消',
      buttons: [],
      finish: function() {
        var year = Session.get("curSwiperYear");
        var month = Session.get("curSwiperMonth");
        var day = Session.get("curSwiperDay");
        var momentObj = moment([year, month-1, day]);
        if (!momentObj.isValid() || !momentObj.isBefore(moment(new Date()))) {
          alert("选择出错，请重新选择");
          return;
        }
        var birthday = year+'-'+month+'-'+day;
        if (birthday!==Meteor.user().profile.birthday) {
          Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.birthday':birthday}});
        }
      }
    });
  },
  'click #mineProfileGrade': function(e) {
    IonActionSheetCustom.show('_gradeActionSheet',{
      finishText: '完成',
      cancelText: '取消',
      buttons: [],
      finish: function() {
        var grade =  Session.get("curSwiperGrade");
        if (!grade) {
          alert("不能为空！");
          return;
        }
        if (grade!==Meteor.user().profile.grade) {
          Meteor.users.update({_id: Meteor.userId()}, {$set: {'profile.grade':grade}});
          Session.set("curSwiperGrade",'');
        }
      }
    });
  }
});
