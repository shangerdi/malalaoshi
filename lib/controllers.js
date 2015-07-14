/* 管理员-审核老师界面 - controller */
AuditTeachersController = RouteController.extend({
  increment: 10,
  sort: {submitTime: 1},
  teachersLimit: function() { 
    return parseInt(this.params.teachersLimit) || this.increment; 
  },
  nextPath: function() {
    return this.route.path({teachersLimit: this.teachersLimit() + this.increment})
  },
  findOptions: function() {
    return {sort: this.sort, limit: this.teachersLimit()};
  },
  subscriptions: function() {
    this.teachersSubs = Meteor.subscribe('teacherAudits', this.findOptions());
  },
  teachers: function() {
    return TeacherAudit.find({}, this.findOptions());
  },
  data: function() {
    var self = this;
    return {
      teachers: self.teachers(),
      ready: self.teachersSubs.ready,
      nextPath: function() {
        if (self.teachers().count() === self.teachersLimit())
          return self.nextPath();
      }
    };
  }
});