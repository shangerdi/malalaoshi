var studyCenters = [
  {
    id: "testid1",
    name: "麻辣学习中心大望路",
    city: "北京",
    address: "大望路13号",
    avatar: "https://s3-ap-southeast-1.amazonaws.com/my.images.head/test_1234/1438334988731.png",
    lng: 116.481646,
    lat: 39.912037,
    lngRadian: 2.032988240842483,
    latRadian: 0.6965964568278,
    latSin: 0.6416107875198254,
    latCos: 0.7670303757597801
  },
  {
    id: "testid2",
    name: "麻辣学习中心慈云寺",
    city: "北京",
    address: "慈云寺9号",
    avatar: "https://s3-ap-southeast-1.amazonaws.com/my.images.head/12323232323/1437113067545.jpg",
    lng: 116.495264,
    lat: 39.920864,
    lngRadian: 2.0332259197800195,
    latRadian: 0.6967505170408737,
    latSin: 0.6417289487683101,
    latCos: 0.7669315199629754
  },
  {
    id: "testid3",
    name: "麻辣学习中心金茂府",
    city: "北京",
    address: "金茂路19号",
    avatar: "https://s3-ap-southeast-1.amazonaws.com/my.images.head/test_1234/1438334988731.png",
    lng: 116.494869,
    lat: 39.901632,
    lngRadian: 2.033219025729474,
    latRadian: 0.69641485531913,
    latSin: 0.6414714830672817,
    latCos: 0.7671468805981434
  },
  {
    id: "testid4",
    name: "麻辣学习中心双井",
    city: "北京",
    address: "双井路32号",
    avatar: "https://s3-ap-southeast-1.amazonaws.com/my.images.head/12222222228/1437104277843.jpg",
    lng: 116.470399,
    lat: 39.899777,
    lngRadian: 2.032791943661511,
    latRadian: 0.6963824794615056,
    latSin: 0.6414466456929088,
    latCos: 0.7671676483854856
  },
  {
    id: "testid5",
    name: "麻辣学习中心永安里",
    city: "北京",
    address: "永安里78号",
    avatar: "https://s3-ap-southeast-1.amazonaws.com/my.images.head/12222222223/1437104448883.jpg",
    lng: 116.457751,
    lat: 39.914721,
    lngRadian: 2.0325711944177187,
    latRadian: 0.6966433014649236,
    latSin: 0.6416467180754457,
    latCos: 0.7670003188936818
  },
  {
    id: "testid6",
    name: "麻辣学习中心雍和宫",
    city: "北京",
    address: "雍和宫后门",
    avatar: "https://s3-ap-southeast-1.amazonaws.com/my.images.head/12222222229/1437104183029.jpg",
    lng: 116.422106,
    lat: 39.954555,
    lngRadian: 2.0319490718058453,
    latRadian: 0.697338535919163,
    latSin: 0.6421798080103278,
    latCos: 0.7665540386586053
  }
];

function getStudyCentersByCity(city){
  console.log('call getStudyCentersByCity');
  return studyCenters;
}

function calculateDistance(pointA, pointB){
  var R = 6371000; // metres
  var toRadians = Math.PI/180;

  return Math.acos(Math.sin(toRadians * pointA.lat) * Math.sin(toRadians * pointB.lat) + Math.cos(toRadians * pointA.lat) * Math.cos(toRadians * pointB.lat) * Math.cos(toRadians * pointB.lng - toRadians * pointA.lng)) * R;
}

function compDistance(pointA, pointB){
  return pointA.distance < pointB.distance ? -1 : 1;
}

Meteor.methods({
  getStudyCentersByPlace: function(city, lng, lat){
    var curUser = Meteor.user();
    if (!curUser){
      throw new Meteor.Error('权限不足', "当前用户权限不足");
    }

    var pointBasic = {
      lat: lat,
      lng: lng
    }

    var retStudyCenters = [];
    _.each(getStudyCentersByCity(city), function(element) {
      element.distance = calculateDistance({lat: element.lat, lng: element.lng}, pointBasic);
      retStudyCenters[retStudyCenters.length] = element;
    });

    retStudyCenters.sort(compDistance);
    return retStudyCenters.length > 10 ? retStudyCenters.slice(0,10): retStudyCenters;
  }
});
