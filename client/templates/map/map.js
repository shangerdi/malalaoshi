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
      var pp = local.getResults().getPoi(0).point;
      Session.set("locationLngLat", pp);
      map.centerAndZoom(pp, 16);
      map.addOverlay(new BMap.Marker(pp));
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
  Session.set("locationPlaceholder", "请输入地址");
  Session.set("locationDefaultCity", "北京市");
});
Template.map.rendered=function(){
  var template=this;
  window.CKEDITOR_BASEPATH = "/ckeditor/";

  $.when(
    $.getScript("http://api.map.baidu.com/getscript?v=2.0&ak="+Meteor.settings.public.baiduAK)
  ).done(function(){
    var map = new BMap.Map("allmap");

    var geolocationControl = new BMap.GeolocationControl();
    Template.map.map = map;
    Template.map.geolocationControl = geolocationControl;
    geolocationControl.addEventListener("locationSuccess", function(e){
      if(lastAct === "auto"){
        mapMoveAndOverlay(map, e);
        Session.set("locationAddress", e.addressComponent.city + e.addressComponent.district + e.addressComponent.street + e.addressComponent.streetNumber);
      }
    });
    geolocationControl.addEventListener("locationError",function(e){
      Session.set("locationPlaceholder", "定位错误，请手动输入位置");
    });
    lastAct = "auto";
    geolocationControl.location();

    var ac = new BMap.Autocomplete({
      "input" : "searchInput",
      "location" : Session.get("locationDefaultCity")
    });
    ac.setInputValue(Session.get("locationAddress"));
  	ac.addEventListener("onconfirm", function(e){
      IonKeyboard.close();
      var _value = e.item.value;
      Session.set("locationAddress", _value.province +  _value.city +  _value.district +  _value.street +  _value.business);

  		setPlace(Template.map.map);
  	});
  }).fail(function(e){
  });
};
Template.map.helpers({
  placeholder: function(){
    return Session.get("locationPlaceholder");
  },
  locationAddress: function(){
    return Session.get("locationAddress");
  }
});
Template.map.events({
  'click #searchIcon, keyup #searchInput': function(e){
    e.preventDefault();

    var doSearch = false;
    if(e.target.id === "searchIcon"){
      doSearch = true;
    }else if(e.target.id === "searchInput" && e.keyCode === 13){
      doSearch = true;
    }
    if(doSearch){
      Session.set("locationAddress", $.trim($("#searchInput").val()));
      setPlace(Template.map.map);
    }
  }
});
