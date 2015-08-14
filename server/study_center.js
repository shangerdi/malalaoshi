var studyCenters = [
  {
    name: "麻辣学习中心大望路",
    city: "北京",
    lng: 116.481646,
    lat: 39.912037,

  },
  {
    name: "麻辣学习中心慈云寺",
    city: "北京",
    lng: 116.495264,
    lat: 39.920864
  },
  {
    name: "麻辣学习中心金茂府",
    city: "北京",
    lng: 116.494869,
    lat: 39.901632
  },
  {
    name: "麻辣学习中心双井",
    city: "北京",
    lng: 116.470399,
    lat: 39.899777
  },
  {
    name: "麻辣学习中心永安里",
    city: "北京",
    lng: 116.457751,
    lat: 39.914721
  },
  {
    name: "麻辣学习中心雍和宫",
    city: "北京",
    lng: 116.422106,
    lat: 39.954555,
    lngRadian: 2.0319490718058453,
    latRadian: 0.697338535919163
    latSin: 0.6421798080103278,
    latCos: 0.7665540386586053
  }
];
double d =  Math.acos(Math.sin(lat1)*Math.sin(lat2)+Math.cos(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1))*R;
function getStudyCentersByCity(city){
  console.log('call getStudyCentersByCity');
  return studyCenters;
}

function getDistance(a_lng, a_lat, b_lng, b_lat){
  var l = a_lng - b_lng;
  l *= l;
  var w = a_lat - b_lat;
  w *= w;
  return Math.sqrt(l + w);
}

var quickSort = function(arr){
  if (arr.length <= 1){return arr;}
  var pivotIndex = Math.floor(arr.length / 2);
  var pivot = arr.splice(pivotIndex, 1)[0];
  var left = [];
  var right = [];
  for(var i = 0; i < arr.length; i++){
    if(arr[i].distance < pivot.distance){
      left.push(arr[i]);
    }else{
      right.push(arr[i]);
    }
  }
  return quickSort(left).concat([pivot], quickSort(right));
};
Meteor.methods({
  getStudyCentersByPlace: function(city, lng, lat){
    var curUser = Meteor.user();
    if (!curUser){
      throw new Meteor.Error('权限不足', "当前用户权限不足");
    }

    var studyCenters = getStudyCentersByCity(city);
    _.each(studyCenters, function(element) {
      element.distance = getDistance(element.lng, element.lat, lng, lat);
    });
    studyCenters = quickSort(studyCenters);

    return studyCenters.length > 10 ? studyCenters.splice(0,10): studyCenters;
  }
});
