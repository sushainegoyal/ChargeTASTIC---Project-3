// Adding base tile layer to the map
var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
});

// Assemble API query URL from flask
var url = "/api/allocations";
//var url = "https://api.openchargemap.io/v3/poi/?output=json&countrycode=CA&maxresults=100000&includecomments=true&verbose=true&opendata=true&client=ev-charging-stations&key=f6e470b3-c2f2-4c69-a477-3dbac08fea4b"
//var url = "mongodb://heroku_kmpx4htl:388nghofnub05u3dgf17qgf8lb@ds045588.mlab.com:45588/heroku_kmpx4htl?retryWrites=false"

// Store the response in a variable
var data = d3.json(url);

// get all the connector types and add them into the layer group layers
data.then(function(response) {
  // make a js object that stores the connector types and the number of each
  var types = {};
  var overlaysDict = {};

  response.forEach(function(location){
    // Get the list of connection types for each station
    var lis = location.Connections
    // Get the address information for each station
    var latlng = location.AddressInfo
    // Get the address and city for each station
    var address = latlng.AddressLine1
    var town = latlng.Town
    // Replace all space in the address string with "+"
    address = address.replace(/ /g,"+")
    // Concatenate the address and the city string 
    var plus = address.concat("+")
    var full_address = plus + town
    // Define all google map url for directions and search nearby
    var DIR_link = 'https://www.google.com/maps/dir/?api=1&origin=current+location&destination=' +  full_address + '' + '&travelmode=driving';
    var hotel_link ="https://www.google.com/maps/search/?api=1&query=hotel+around+" + full_address
    var rest_link = "https://www.google.com/maps/search/?api=1&query=restaurants+around+" + full_address
    var mall_link = "https://www.google.com/maps/search/?api=1&query=shopping+around+" + full_address
    // Add button function to each popup
    //var direction = '<button<a href ='+DIR_link+' target="_blank">Get Direction</a></button>'
    //var direction = '<form action="' + DIR_link + '" method ="get" target="_blank"><button type="submit">Get Direction</button>'
    //var direction = '<button onclick="window.location.href="' + DIR_link + '";">Click Here</button>'
    var direction = '<a href=' + DIR_link + ' target="_blank"><button>Get Direction</button></a>'
    var hotel = '<a href=' + hotel_link + ' target="_blank"><button>Hotels Nearby</button></a>'
    var rest = '<a href=' + rest_link + ' target="_blank"><button>Restaurants Nearby</button></a>'
    var shopping = '<a href=' + mall_link + ' target="_blank"><button>Shopping Nearby</button></a>'
    // console.log(address)
    for (i=0; i<lis.length; i++) {
      var type = lis[i].ConnectionType.Title
      //console.log(type)
      // Check each connector type, if the type exists, add the mark and popup, if not, add the new type to the 
      // layer group and add the mark and popup
      if (type in types){
        types[type] = types[type]+1;
        var newMarker = L.marker([latlng.Latitude, latlng.Longitude]);
        newMarker.addTo(overlaysDict[type]);
        newMarker.bindPopup("<h3>"+latlng.Title+"</h3><hr><p>"+"ConnectionType: "+ type + "</p> <p> Power Level: " + lis[i].LevelID +"<br>" + direction + "<br>" +hotel + "<br>" + rest + "<br>" + shopping);
      }
      else {
        types[type] = 1;
        overlaysDict[type] = new L.LayerGroup();
        // Set the data location property to a variable
        // var DIR_link = 'https://www.google.com/maps/dir/?api=1&origin=current+location&destination=' +  full_address + '&travelmode=driving';
        // var direction = '<a href ='+DIR_link+' target="_blank">Get Direction</a>'
        // var hotel = '<a href=' + hotel_link + ' target="_blank"><button>Hotels Nearby</button></a>'
        var newMarker = L.marker([latlng.Latitude, latlng.Longitude]);
        newMarker.addTo(overlaysDict[type]);
        newMarker.bindPopup("<h3>"+latlng.Title+"</h3><hr><p>"+"ConnectionType: "+ type + "</p> <p> Power Level: " + lis[i].LevelID +"<br>" + direction + "<br>" +hotel + "<br>" + rest + "<br>" + shopping);
      };
    };
  });

  // Creating map object when this page is open in the browser
  var myMap = L.map("map", {
    center: [56.1304, -106.3468],
    zoom:4.4,
    layers : Object.values(overlaysDict)
  });

  // Add our 'streetmap' tile layer to the map
  streetmap.addTo(myMap);
  console.log(Object.values(overlaysDict))

  // Show overlayes
  console.log(overlaysDict)

  // Create a control for our layers, add our overlay layers to it
   L.control.layers(null, overlaysDict).addTo(myMap);

  //Seach Nearby Button Handler, get the user's current location by calling function showPosition
  function handleSearchNearBy() {

    d3.event.preventDefault();
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
      console.log(navigator.geolocation.getCurrentPosition(showPosition))
    } else {
      x.innerHTML = "Geolocation is not supported by this browser.";
    }
  }

  function showPosition(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    current_location=[lat,lng]
    console.log(current_location);
    buildMap(current_location);
  };

  // Function buildMap to add the marker of user's current location to the map
  function buildMap(current_location) {
  // Create a new marker, if the marker exists, remove it and create a new one
  var Mymarker = {};
  if (Mymarker.length>0) {
    Mymarker.remove()
  };
  // Pass in some initial options, and then add it to the map using the addTo method
  var Mymarker = L.circle(current_location).addTo(myMap);
  // Binding a pop-up to our marker
  Mymarker.bindPopup("You Are Here");
  // Set the map view to the current location and zoom it in
  myMap.panTo(Mymarker.getLatLng());
  myMap.setZoom(15);
  };

  // Call function handleSearchNearby when button "Search Nearby" is clicked
  d3.select("#submit").on("click", handleSearchNearBy);

});



