var defaultCoordLon = -121.498539;
var defaultCoordLat = 38.581782;
const sidebar = $(`#sidebar`)
mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VzdmFsZW56dWVsYSIsImEiOiJjazZwbmZzd2oxazBmM2RwZnFsNzV3bXNvIn0.GgP5i29Ffv8dOn058uUaIQ';

var aToken = `pk.eyJ1IjoiZ3VzdmFsZW56dWVsYSIsImEiOiJjazZwbmZzd2oxazBmM2RwZnFsNzV3bXNvIn0.GgP5i29Ffv8dOn058uUaIQ`
const queryForm = $(`#query-form`)


var queryTerm = `groceries`

$.ajax({
    url: `https://api.mapbox.com/geocoding/v5/mapbox.places/` + queryTerm + `.json?proximity=` + defaultCoordLon + `,` + defaultCoordLat + `&access_token=` + mapboxgl.accessToken,
    method: `GET`,
}).then(function (response) {
    console.log(`mapbox query: `, response)
    // var mapCenterLon = map.transform._center.lng
    // var mapCenterLat = map.transform._center.lat
    var mapCenterLon = response.features[0].center[0]
    var mapCenterLat = response.features[0].center[1]
    var results = []
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [mapCenterLon, mapCenterLat],
        zoom: 11.66
    });
    
    var geojson = {
        'type': 'FeatureCollection',
        'features': []
    };

    for (i = 0; i < response.features.length; i++) {
        results[i] = {}
        results[i].name = response.features[i].text
        results[i].nameAndAddress = response.features[i].place_name
        results[i].address = response.features[i].properties.address
        var lon = response.features[i].center[0]
        var lat = response.features[i].center[1]

        geojson.features[i] = {}
        geojson.features[i].type = `Feature`
        geojson.features[i].properties = {}
        geojson.features[i].properties.message = response.features[i].text
        geojson.features[i].properties.iconSize = []
        geojson.features[i].properties.iconSize.push(60, 60)
        geojson.features[i].geometry = {}
        geojson.features[i].geometry.type = `Point`
        geojson.features[i].geometry.coordinates = []
        geojson.features[i].geometry.coordinates.push(lon, lat)
        
    }

    // add markers to map
    geojson.features.forEach(function (marker) {
        var customID = 0
        // create a DOM element for the marker
        var el = document.createElement('div');
        $(el).prepend($(`<div class="marker-message">`).attr(`id`,`marker-`+customID).text(marker.properties.message))
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

        customID++
    });

    for(j=0;j<results.length;j++){
        // adding to sidebar
        // var link = $(`<a>`).attr(`href`,`#marker-`+j)
        var li = $(`<li class="sidebar-list-items">`).attr(`id`,j).text(results[j].name + ` - ` + results[j].address)
        sidebar.append(li)
    }
    $(`.sidebar-list-items`).on(`click`,function(e){
        var el = e.target
        var newCenterLon = geojson.features[el.id].geometry.coordinates[1]
        var newCenterLat = geojson.features[el.id].geometry.coordinates[0]
        console.log(map)
        map.transform._center.lng = newCenterLon
        map.transform._center.lat = newCenterLat
        // console.log(map.transform._center.lng)
    })
})
// })