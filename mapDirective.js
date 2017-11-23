var markers = [];
var app = angular.module('app', []);


app.factory('Map', function(){
  var factory = {};
   
   factory.setCenter = function(geolocation) {
      var marker = JSON.parse(geolocation);
      factory.lat = marker['geoLocation']['0']['x'];
      factory.long = marker['geoLocation']['0']['y'];
   }
   factory.marker = function(mapd, lat, long, icon){
         if(factory.markerData){
            factory.markerData.setMap(null); 
         }
         var marker=new google.maps.Marker({
              position:new google.maps.LatLng(lat,long),
              icon: icon
         });
         factory.markerData=marker;
         marker.setMap(mapd);
   }
   factory.setMap = function(lat, long){
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: lat, lng: long},
          zoom: 5
       });
        factory.map = map;
   }
   factory.getMap = function(){
      return factory.map;
   }
   factory.getLat = function(){
      return factory.lat;
   }
   factory.getLong = function(){
      return factory.long;
   }
   factory.setIcon = function(marker){
      var marker = JSON.parse(marker);
      var icon = marker['geoLocation']['0'];
      if(icon['icon']){
        if(['url']){
          url = icon['url'];
        }
        else{
          url = "icon.png";
        }

        if(icon['height']){
          height = icon['height'];
        }
        else {
          height = 71;
        }

        if(icon['width']){
          width = icon['width'];
        }
        else {
          width = 71;
        }
      }
      else {
        url = "icon.png";
        height = 71;
        width = 71;
      }
      var icon = {
        url: url,
        size: new google.maps.Size(height, width),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };
      factory.icon = icon; 
   }
   factory.getIcon = function(){
      return factory.icon;
   }
   factory.lat = 0;
   factory.long = 0;
   
   return factory;
});

app.directive('marker', ['Map', function(Map) {
  return {
    replace: true,
    controller: 'myCtrl',
    link: function(scope, element, attrs) {
      attrs.$observe('marker', function(value) {

          var mapd = Map;
          mapd.setCenter(value);
          var lat = mapd.getLat();
          var long = mapd.getLong();

          mapd.setIcon(value);
          var icon = mapd.getIcon();

          mapd.setMap(lat, long);
          map = mapd.getMap();

          var input = document.getElementById('pac-input');
          var searchBox = new google.maps.places.SearchBox(input);
          map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
          map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
        });

        
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
          var places = searchBox.getPlaces();

          if (places.length == 0) {
            return;
          }

          // Clear out the old markers.
          markers.forEach(function(marker) {
            marker.setMap(null);
          });
          mapd.markerData.setMap(null); 
          markers = [];

          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();
          places.forEach(function(place) {
            if (!place.geometry) {
              return;
            }
            
            mapd.lat = place.geometry.location.lat();
            mapd.long = place.geometry.location.lng();
            markers.push(new google.maps.Marker({
              map: map,
              icon: icon,
              title: place.name,
              position: place.geometry.location
            }));

            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          jQuery(".loading").addClass("show");
          map.fitBounds(bounds);
        });
          jQuery(".loading").addClass("show");
          map.addListener('idle', function() {
            jQuery(".loading").removeClass("show");
            jQuery(".loading").addClass("hide");
          
           });

          mapd.marker(map, lat, long, icon);
      });
    }
  };
}]);

app.directive('divGoogle', function() {
      var directive = {};
      directive.restrict = 'E';
      directive.template = '<div id="map" style="width: {{width}}; height: {{height}}; margin-top:{{y}}; margin-left:{{x}}"></div>';
      directive.scope = {
         width: '@',
         height: '@',
         x: '@',
         y: '@'
       }
      directive.compile = function(element, attributes){
         element.css("border", "1px solid #cccccc");
         
         var linkFunction = function($scope, element, attributes) {
            element.html = '<div id="map" style="width: {{width}}; height: {{height}}"></div>';
            element.css("background-color", "#ff00ff");

         }
         return linkFunction;
      }
   return directive;
});

app.controller('myCtrl', function ($scope, $element, $attrs, Map) {
    $scope.loadLatLong = function(){
      $scope.lat = Map.getLat();
      $scope.long = Map.getLong();
    }
    $scope.draw = function(){
      markers.forEach(function(marker) {
        marker.setMap(null);
      });
      var map = Map.getMap();
      var icon = Map.getIcon();
      var lat = $scope.lat;
      var long = $scope.long;
      Map.lat = lat;
      Map.long = long;
      Map.marker(map, lat, long, icon);
      map.setCenter(new google.maps.LatLng(lat, long));
      
      jQuery(".loading").addClass("show");
    }


});
