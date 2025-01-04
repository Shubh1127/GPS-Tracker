const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server);

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Store locations of connected users
let userLocations = {};

// Handle new connections from clients
io.on('connection', (socket) => {
    console.log('New user connected: ' + socket.id);

    // Send all the current user locations to the new user upon connection
    socket.emit('currentLocations', userLocations);

    // Listen for location updates from clients
    socket.on('sendLocation', (coords) => {
        // Save the user's location
        userLocations[socket.id] = coords;
        io.emit('locationMessage', { id: socket.id, ...coords });
    });

    // Handle user disconnections
    socket.on('disconnect', () => {
        // Remove user location when they disconnect
        delete userLocations[socket.id];
        io.emit('user-disconnected', socket.id);
        console.log('User disconnected: ' + socket.id);
    });
});

// Serve the main page
app.get('/', (req, res) => {
    res.render('index');
});

// Start the server
server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
