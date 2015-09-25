Coupons = new Mongo.Collection('coupons');

Coupons.attachSchema(new SimpleSchema({
  courseAttendanceId:{
    type: String,
    label: 'CourseAttendance id'
  },
  value: {
    type: Number,
    label: 'Coupon value'
  },
  minCost: {
    type: Number,
    decimal: true,
    label: 'Minimum cost'
  },
  createdAt: {
    type: Number,
    label: 'Created at',
    autoValue: function() {
      if(this.isInsert || this.isUpsert){
        return Date.now();
      }
    }
  },
  expireDate: {
    type: Number,
    label: 'Expire date',
    autoValue: function() {
      if(this.isInsert || this.isUpsert){
        //2592000000 = 30*24*60*60*1000;
        return Date.now() + 2592000000;
      }
    }
  },
  status: {
    type: String,
    label: 'status',
    allowedValues: ['new', 'expired', 'used'],
    defaultValue: 'new'
  }
}));

poissonRandomNumber = function(lambda){
  var L = Math.exp(-lambda),
  p = 1.0
  k = 0;
  do{
    ++k;
    p *= Math.random();
  }while(p > L);
  return k - 1;
}
normalDistribution = function(min, max){
  var h = (max - min) / 2;
  return h * ((Math.random() + Math.random() + Math.random() + Math.random() + Math.random() + Math.random()) - 3) / 3 + min + h;
}
