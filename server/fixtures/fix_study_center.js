if(StudyCenters.find().count() == 0){
  var list = [
    {
        "_id" : "testid1",
        "name" : "麻辣学习中心大望路",
        "city" : "北京市",
        "address" : "大望路13号",
        "avatar" : "https://s3-ap-southeast-1.amazonaws.com/my.images.head/test_1234/1438334988731.png",
        "lng" : 116.481646,
        "lat" : 39.912037
    },
    {
        "_id" : "testid2",
        "name" : "麻辣学习中心慈云寺",
        "city" : "北京市",
        "address" : "慈云寺9号",
        "avatar" : "https://s3-ap-southeast-1.amazonaws.com/my.images.head/12323232323/1437113067545.jpg",
        "lng" : 116.495264,
        "lat" : 39.920864
    },
    {
        "_id" : "testid3",
        "name" : "麻辣学习中心金茂府",
        "city" : "北京市",
        "address" : "金茂路19号",
        "avatar" : "https://s3-ap-southeast-1.amazonaws.com/my.images.head/test_1234/1438334988731.png",
        "lng" : 116.494869,
        "lat" : 39.901632
    },
    {
        "_id" : "testid4",
        "name" : "麻辣学习中心双井",
        "city" : "北京市",
        "address" : "双井路32号",
        "avatar" : "https://s3-ap-southeast-1.amazonaws.com/my.images.head/12222222228/1437104277843.jpg",
        "lng" : 116.470399,
        "lat" : 39.899777
    },
    {
        "_id" : "testid5",
        "name" : "麻辣学习中心永安里",
        "city" : "北京市",
        "address" : "永安里78号",
        "avatar" : "https://s3-ap-southeast-1.amazonaws.com/my.images.head/12222222223/1437104448883.jpg",
        "lng" : 116.457751,
        "lat" : 39.914721
    },
    {
        "_id" : "testid6",
        "name" : "麻辣学习中心雍和宫",
        "city" : "北京市",
        "address" : "雍和宫后门",
        "avatar" : "https://s3-ap-southeast-1.amazonaws.com/my.images.head/12222222229/1437104183029.jpg",
        "lng" : 116.422106,
        "lat" : 39.954555
    }
  ];
  _.each(list, function(item){
    StudyCenters.insert(item);
  });
}
