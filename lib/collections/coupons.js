Coupons = new Mongo.Collection('coupons');

var CouponsSchema = new SimpleSchema({
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
    optional: true,
    autoValue: function() {
      if(this.isInsert || this.isUpsert){
        return Date.now();
      }
    }
  },
  expireDate: {
    type: Number,
    label: 'Expire date',
    optional: true,
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
});
