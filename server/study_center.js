function getStudyCentersByCity(city){
  return StudyCenters.find({"city": city});
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
    getStudyCentersByCity(city).forEach(function(element){
      element.distance = calculateDistance({lat: element.lat, lng: element.lng}, pointBasic);
      retStudyCenters[retStudyCenters.length] = element;
    });

    retStudyCenters.sort(compDistance);
    return retStudyCenters.length > 10 ? retStudyCenters.slice(0,10): retStudyCenters;
  }
});
