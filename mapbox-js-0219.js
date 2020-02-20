mapboxgl.accessToken = 'pk.eyJ1Ijoic3F1aWRkb3RqcGVnIiwiYSI6ImNrNmxsMG43dTBjczQzanBkODhjaWd2OWMifQ.HY9YBWTOksKHlIglaCkVlA';
var map = new mapboxgl.Map({
    container: 'map', // Container ID
    style: 'mapbox://styles/mapbox/streets-v11', // Map style to use
    center: [-121.4944, 38.5816], // Starting position [lng, lat]
    zoom: 12, // Starting zoom level
});



var geocoder = new MapboxGeocoder({ // Initialize the geocoder
    accessToken: mapboxgl.accessToken, // Set the access token
    mapboxgl: mapboxgl, // Set the mapbox-gl instance
    marker: false, // Do not use the default marker style
    placeholder: 'Search for grocery stores in Sacramento', // Placeholder text for the search bar
    // bbox: [-121.49445, 38.84214, -121.30937, 38.89838,],
    // proximity: {
    //     longitude: -121.4944,
    //     latitude: 38.5816
    // } // Coordinates of Sacramento
});

// Add geolocate control to the map.
map.addControl(
    new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    })
);

// Add the geocoder to the map
map.addControl(geocoder);

// After the map style has loaded on the page,
// add a source layer and default styling for a single point
map.on('load', function () {
    map.addSource('single-point', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    });

    map.addLayer({
        id: 'point',
        source: 'single-point',
        type: 'circle',
        paint: {
            'circle-radius': 10,
            'circle-color': '#448ee4'
        }
    });

    // Listen for the `result` event from the Geocoder
    // `result` event is triggered when a user makes a selection
    //  Add a marker at the result's coordinates
    geocoder.on('result', function (e) {
        map.getSource('single-point').setData(e.result.geometry);
    });
});