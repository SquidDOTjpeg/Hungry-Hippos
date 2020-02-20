var defaultCoordLon = -121.498539;
var defaultCoordLat = 38.581782;
mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VzdmFsZW56dWVsYSIsImEiOiJjazZwbmZzd2oxazBmM2RwZnFsNzV3bXNvIn0.GgP5i29Ffv8dOn058uUaIQ';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [defaultCoordLon, defaultCoordLat],
    zoom: 11.66
});
var aToken = `pk.eyJ1IjoiZ3VzdmFsZW56dWVsYSIsImEiOiJjazZwbmZzd2oxazBmM2RwZnFsNzV3bXNvIn0.GgP5i29Ffv8dOn058uUaIQ`
const queryForm = $(`#query-form`)

// queryForm.on(`submit`, function (e) {
// e.preventDefault()
// var queryTerm = $(`#query-input`).val()
var queryTerm = `safeway`
// taking input value and searching in mapbox api 
$.ajax({
    url: `https://api.mapbox.com/geocoding/v5/mapbox.places/` + queryTerm + `.json?proximity=` + defaultCoordLon + `,` + defaultCoordLat + `&access_token=` + mapboxgl.accessToken,
    method: `GET`,
}).then(function (response) {
    // console.log(`mapbox query: `, response)
    // var mapCenterLon = map.transform._center.lng
    // var mapCenterLat = map.transform._center.lat
    var mapCenterLon = response.features[0].center[0]
    var mapCenterLat = response.features[0].center[1]
    var geojson = {
        'type': 'FeatureCollection',
        'features': []
    };

    for (i = 0; i < response.features.length; i++) {

        var lon = response.features[i].center[0]
        var lat = response.features[i].center[1]

        geojson.features[i] = {}
        geojson.features[i].type = `Feature`
        geojson.features[i].properties = {}
        geojson.features[i].properties.message = `POI #` + (i + 1)
        geojson.features[i].properties.iconSize = []
        geojson.features[i].properties.iconSize.push(56, 56)
        geojson.features[i].geometry = {}
        geojson.features[i].geometry.type = `Point`
        geojson.features[i].geometry.coordinates = []
        geojson.features[i].geometry.coordinates.push(lon, lat)
    }

    // add markers to map
    geojson.features.forEach(function (marker) {
        // create a DOM element for the marker
        var el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundImage =
            'url(./marker.png)';
        el.style.width = marker.properties.iconSize[0] + 'px';
        el.style.height = marker.properties.iconSize[1] + 'px';

        el.addEventListener('click', function () {
            alert(marker.properties.message);
        });

        // add marker to map
        new mapboxgl.Marker(el)
            .setLngLat(marker.geometry.coordinates)
            .addTo(map);
    });
})
// })