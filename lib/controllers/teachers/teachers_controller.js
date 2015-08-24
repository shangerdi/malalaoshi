/* 老师列表页面 - controller */
TeachersController = RouteController.extend({
  increment: 200,
  teachersLimit: function() {
    return parseInt(this.params.teachersLimit) || this.increment;
  },
  find: function(){
    return {'status.basic': 'approved'};
  },
  findOptions: function() {
    var limit = Session.get("teachersLimit");
    if(!limit){
      limit = this.teachersLimit();
      Session.set("teachersLimit", limit);
    }
    return {sort: {createdAt: -1 }, limit: limit};
  },
  parameters: function(){
    return {
      find: this.find(),
      options: this.findOptions()
    }
  },
  waitOn: function() {
    var limit = Session.get("teachersLimit");
    var subject = Session.get('teachersSubject');
    var grade = Session.get('teachersGrade');
    var locationPoint = Session.get("locationLngLat");
    var way  = Session.get('teachersTeacherWay');
    var studyCenters = Session.get('selectedStudyCenters');
    var subscriptionTerms = this.parameters();

    if(subject){
      if(subject != "all"){
        subscriptionTerms.find = _.extend(subscriptionTerms.find, {"profile.subjects.subject": subject});
      }
    }
    if(grade){
      if(grade != "all"){
        subscriptionTerms.find = _.extend(subscriptionTerms.find, {"profile.subjects.grade": grade});
      }
    }
    subscriptionTerms.find = _.extend(subscriptionTerms.find, {"profile.teacherType": way});
    if(way == "studyCenter"){
      subscriptionTerms.find = _.extend(subscriptionTerms.find, {'profile.studyCenter': {"$in": studyCenters}});
    }
    if(limit){
      subscriptionTerms.options.limit = limit;
    }

    this.teachersSub = Meteor.subscribe('teachers', subscriptionTerms);
    return this.teachersSub;
  },
  teachers: function(parameters) {
    return Meteor.users.find(parameters.find, parameters.findOptions);
  },
  data: function() {
    var parameters = {
      find: this.find(),
      findOptions: this.findOptions()
    };
    var teachers = this.teachers(parameters);

    var hasMore = teachers.count() === this.teachersLimit();
    var nextPath = this.route.path({teachersLimit: this.teachersLimit() + this.increment});
    return {
      teachers: teachers,
      ready: this.teachersSub.ready,
      nextPath: hasMore ? nextPath : null,
      terms: this.parameters()
    };
  }
});
