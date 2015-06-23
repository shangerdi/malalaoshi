Template.auditTeacher.helpers({
  auditInfo: function() {
    var auditInfo = UserAudit.findOne({'userId': Router.current().params._userId});
    return auditInfo;
  },
  getSubmitTime: function(part) {
    var auditInfo = UserAudit.findOne({'userId': Router.current().params._userId});
    if (part=='basic') {
      submitDate = new Date(auditInfo.basicInfo.submitTime);
    }
    if (part=='edu') {
      submitDate = new Date(auditInfo.eduInfo.submitTime);
    }
    if (part=='cert') {
      submitDate = new Date(auditInfo.certInfo.submitTime);
    }
    return submitDate.getFullYear()+'-'+(submitDate.getMonth()+1)+'-'+submitDate.getDate()+' '+submitDate.getHours()+':'+submitDate.getMinutes();
  },
  isTodoAudit: function(part) {
    var auditInfo = UserAudit.findOne({'userId': Router.current().params._userId});
    if (part=='basic') {
      status = auditInfo.basicInfo.status;
    }
    if (part=='edu') {
      status = auditInfo.eduInfo.status;
    }
    if (part=='cert') {
      status = auditInfo.certInfo.status;
    }
    return (status=='submited');
  },
  basicInfo: function() {
    var user = Meteor.users.findOne(Router.current().params._userId);
    return user.profile;
  },
  state: function() {
    var stateMap = {
      1: "在职教师",
      2: "准教师"
    };
    var stateStr = stateMap[Meteor.users.findOne(Router.current().params._userId).profile.state];
    return stateStr;
  },
  address: function() {
    var basicInfo = Meteor.users.findOne(Router.current().params._userId).profile;
    if (!basicInfo.address) {
      return "";
    }
    var addressStr = "", addrObj = basicInfo.address;
    if (addrObj.province && addrObj.province.code) {
      addressStr += addrObj.province.name;
    }
    if (addrObj.province && addrObj.province.type!=1) {
      if (addrObj.city && addrObj.city.code) {
        addressStr += addrObj.city.name;
      }
    }
    if (addrObj.district && addrObj.district.code) {
      addressStr += addrObj.district.name;
    }
    if (addrObj.road) {
      addressStr += addrObj.road;
    }
    return addressStr;
  },
  eduInfo: function() {
    return UserEducation.findOne({userId: Router.current().params._userId});
  },
  getDegreeStr: function(degree) {
    var degreeMap = {
      "postDoctor":"博士后",
      "doctor":"博士",
      "master":"硕士",
      "bachelor":"本科",
      "vocational":"专科",
      "highSchool":"高中"
    };
    return degreeMap[degree];
  },
  certInfo: function() {
    return UserCertification.findOne({userId: Router.current().params._userId});
  }
});
