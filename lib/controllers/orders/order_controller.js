/* 家长端 - 订单详情页面 - controller */
OrderController = RouteController.extend({
  waitOn: function() {
    var orderId = this.params.id;
    var userId = Meteor.userId();
    var teacherId = Session.get('orderTeacherId');
    var parameters = {
      userIds: [userId, teacherId],
      orderId: orderId
    };

    this.orderSub = [
      Meteor.subscribe('teacher', teacherId),
      Meteor.subscribe('order', parameters)
    ];
    return this.orderSub;
  },
  data: function(){
    if(this.ready()){
      var orderId = this.params.id;
      var order = null, student = null, teacher = null, studyCenters = null;
      if(orderId){
        order = Orders.findOne({"_id": orderId});
        if(order){
          if(order.student && order.student.id){
            student = Meteor.users.findOne({"_id": order.student.id});
          }
          if(order.teacher && order.teacher.id){
            teacher = Meteor.users.findOne({"_id": order.teacher.id});
          }
        }
      }else{
        var studentId = Meteor.userId();
        var teacherId = Session.get('orderTeacherId');
        var className = this.params.query.className;
        student = Meteor.users.findOne({"_id": studentId});
        teacher = Meteor.users.findOne({"_id": teacherId});
        studyCenters = teacher && teacher.profile && teacher.profile.studyCenter ? StudyCenter.find({"_id": {$in: teacher.profile.studyCenter}}) : null;

        var school = "", subject = "";
        if(teacher.profile && teacher.profile.subjects){
          var subjects = teacher.profile.subjects[0];
          if(subjects){
            if(subjects.subject){
              subject = getEduSubjectText(subjects.subject);
            }
            if(subjects.school){
              school = getEduSchoolText(subjects.school);
            }
          }
        }

        order = {
          student: {
            id: studentId,
            phoneNo: student.phoneNo,
            name: student.profile.name
          },
          teacher: {
            id: teacherId,
            name: teacher.profile.name
          },
          className: className,
          subject: school + subject,
          status: "submited"
        };
      }

      return {
        student: student,
        teacher: teacher,
        order: order,
        studyCenters: studyCenters
      }
    }
  }
});
