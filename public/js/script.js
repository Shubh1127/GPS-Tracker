const socket = io();

// Flag to check if the map is centered for the first time
let isMapCentered = false;

// Request user's location and send it to the server
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit('sendLocation', { latitude, longitude });
        },
        (error) => {
            alert('Unable to retrieve your location. Please check your permissions.');
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}

// Initialize the map
const map = L.map('map').setView([30, 77], 7);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Shubham',
}).addTo(map);

// Object to store markers for each user by ID
const markers = {};

// Listen for the current user locations when the page is loaded or after reconnect
socket.on('currentLocations', (locations) => {
    // For each user, create a marker for their location
    Object.keys(locations).forEach((id) => {
        const { latitude, longitude } = locations[id];
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    });
});

// Listen for location updates from the server
socket.on('locationMessage', (coords) => {
    const { latitude, longitude, id } = coords;

    // Only center the map the first time for the current user
    if (!isMapCentered && id === socket.id) {
        map.setView([latitude, longitude], 7);
        isMapCentered = true;
    }

    // Update or create the marker for the user
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

// Listen for user disconnection and remove their marker
socket.on('user-disconnected', (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
