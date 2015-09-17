StudyCenters = new Mongo.Collection('StudyCenters');

StudyCenters.attachSchema(new SimpleSchema({
  name: {
    type: String,
    label: 'Name'
  },
  city:{
    type: String,
    label: 'city'
  },
  address:{
    type: String,
    label: 'Address'
  },
  avatar:{
    type: String,
    label: 'Avatar'
  },
  lng: {
    type: Number,
    decimal: true,
    label: 'longitude'
  },
  lat: {
    type: Number,
    decimal: true,
    label: 'latitude'
  }
}));

calculateDistance = function(pointA, pointB){
  var R = 6371000; // metres
  var toRadians = Math.PI/180;

  return Math.acos(Math.sin(toRadians * pointA.lat) * Math.sin(toRadians * pointB.lat) + Math.cos(toRadians * pointA.lat) * Math.cos(toRadians * pointB.lat) * Math.cos(toRadians * pointB.lng - toRadians * pointA.lng)) * R;
};

compDistance = function(pointA, pointB){
  return pointA.distance < pointB.distance ? -1 : 1;
}
