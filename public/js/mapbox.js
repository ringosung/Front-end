/* eslint-disable */
export const displayMap = locations => {
    mapboxgl.accessToken =
    'pk.eyJ1IjoicmluZ29zdW5nIiwiYSI6ImNsMnVyZXltczAxZWwzYnFvaHM4MTQ0M3YifQ.tmcOS4XeHwTTiYo7ICWa4A';
    var map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/ringosung/cl2uwyhwj00p014ks76zxx290', // style URL
    zoom: 10, // starting zoom
    maxZoom: 16,
    scrollZoom: true,
    center: [114.18944925945331, 22.329196444960935]
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
    .setHTML(`<p>${loc.description}</p>Address: <p>${loc.address}</p>`)
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
}

