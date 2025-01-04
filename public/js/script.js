 const socket = io();

 if(navigator.geolocation){
    navigator.geolocation.watchPosition((position)=>{
        const {latitude,longitude}= position.coords;
        socket.emit('sendLocation',{latitude,longitude});
    },(error)=>{
        console.error(error);
    },
    {
    enableHighAccuracy:true,
    timeout:5000,
    maximumAge:0   
    }
)
};

const map=L.map('map').setView([30,77],7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution: 'Shubham'   
}).addTo(map);

const markers={}; 

socket.on('locationMessage',(coords)=>{
    const {latitude,longitude,id}=coords;
    map.setView([latitude,longitude],7);
    if(markers[id]){
        markers[id].setLatLng([latitude,longitude]);
    }else{
        markers[id]=L.marker([latitude,longitude]).addTo(map);
    }
});

socket.on('user-disconnected',(id)=>{
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
})