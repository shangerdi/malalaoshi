var lastAct = null;
function mapMoveAndOverlay(map, e){
  var pt = new BMap.Point(e.point.lng, e.point.lat);
  Session.set("locationLngLat", pt);
  var marker = new BMap.Marker(pt);
  map.centerAndZoom(pt, 16);
  map.setCurrentCity(e.addressComponent.city);
  map.enableScrollWheelZoom(true);
  map.addOverlay(marker);
}
function setPlace(map){
  map.clearOverlays();
  function myFun(){
    if(lastAct === "manual" && local.getResults() && local.getResults().getPoi(0)){
      var pt = local.getResults().getPoi(0);
      selectPoint(pt.title, pt.address, pt.point);
    }
  }
  var local = new BMap.LocalSearch(map, {
    onSearchComplete: myFun
  });
  lastAct = "manual";
  local.search(Session.get("locationAddress"));
}
Template.map.onCreated(function(){
  lastAct = null;
  IonNavigation.skipTransitions = true;
  Session.set("locationPlaceholder", "请输入您的上课位置");
  appSetDefaultCity();
  this.locationList = new ReactiveVar([]);
});
function selectPoint(addRess, street, point){
  Session.set("locationLngLat", point);
  Session.set("locationAddress", addRess);
  Session.set("locationStreet", street);

  if (mapCallbackFunction && _.isFunction(mapCallbackFunction)) {
    mapCallbackFunction();
    mapCallbackFunction = null;
    return;
  }
  Router.go("teachersFilter", null, {hash: "setAddress"});
}
Template.map.rendered=function(){
  IonLoading.show({backdrop:true});
  var self = this;

  $.getScript("http://api.map.baidu.com/getscript?v=2.0&ak="+Meteor.settings.public.baiduAK).done(function(){
    IonLoading.hide();
    var map = new BMap.Map("allmap");

    var geolocationControl = new BMap.GeolocationControl({showAddressBar: false});
    Template.map.map = map;
    Template.map.geolocationControl = geolocationControl;
    Template.map.geoc = new BMap.Geocoder();
    geolocationControl.addEventListener("locationSuccess", function(e){
      $('.BMap_geolocationContainer').find('.BMap_geolocationAddress').remove();
      if(lastAct === "auto"){
        mapMoveAndOverlay(map, e);

        self.locationList.set([]);
        Template.map.geoc.getLocation(e.point, function(rs){
          var locationList = [];
          locationList[0] = {
            select: true,
            point: rs.point,
            selectStyle: "location-map-info-i-select",
            title: rs.business,
            address: rs.address
          };
          for(var i=0; i<rs.surroundingPois.length; i++){
            rs.surroundingPois[i].selectStyle = "location-map-info-i-no-select";
            locationList[i+1] = rs.surroundingPois[i];
          }
          self.locationList.set(locationList);
        });
      }
    });
    geolocationControl.addEventListener("locationError",function(e){
      $('.BMap_geolocationContainer').find('.BMap_geolocationAddress').remove();
      Session.set("locationPlaceholder", "定位错误，请手动输入位置");
    });
    $('.BMap_geolocationContainer').find('.BMap_geolocationAddress').remove();
    lastAct = "auto";
    geolocationControl.location();
    map.addControl(geolocationControl);

    var ac = new BMap.Autocomplete({
      "input" : "searchInput",
      "location" : Session.get("locationDefaultCity")
    });
  	ac.addEventListener("onconfirm", function(e){
      IonKeyboard.close();
      $('#searchInput')[0].blur();
      var _value = e.item.value;

      Session.set("locationAddress", _value.province +  _value.city +  _value.district +  _value.street +  _value.business);
  		setPlace(Template.map.map);
  	});

  }).fail(function(e){
  });
};
Template.map.helpers({
  placeholder: function(){
    return Session.get("locationPlaceholder") || "";
  },
  autoLocation: function(){
    return Template.instance().locationList.get();
  }
});
Template.map.events({
  'click .BMap_geolocationIcon': function(){
    lastAct = "auto";
  },
  'click .location-map-info': function(e){
    e.preventDefault();

    selectPoint(this.title, this.address, this.point);
  }
});
