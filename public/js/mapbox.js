/* eslint-disable*/

const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken = 'pk.eyJ1IjoicmluZ29zdW5nIiwiYSI6ImNsMnV1bDEyNTA1cWwza3F0aHBiNXUxOHcifQ.OXQERgSrPqWB91MOZcqFhg';
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/ringosung/cl2uwyhwj00p014ks76zxx290', // style URL
    scrollZoom: false
// center: [-74.5, 40], // starting position [lng, lat]
// zoom: 9 // starting zoom

});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
    //Add marker
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
    }).setLngLat(loc.coordinates).addTo(map);

    new mapboxgl
    .Popup({offset: 30})
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

    // Extend map bounds to include current locations
    bounds.extend(loc.coordinates);
})

map.fitBounds(bounds, {
    padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100
    }
});