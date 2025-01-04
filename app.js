const express=require('express');
const app=express();
const http=require('http');
const path=require('path');
const socketio=require('socket.io');
const server=http.createServer(app);
const io=socketio(server);

app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')));

io.on('connection',(socket)=>{
    socket.on('sendLocation',(coords)=>{
        io.emit('locationMessage',{id:socket.id,...coords});
    });
    socket.on('disconnect',()=>{
        io.emit('user-disconnected',socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
app.get('/',function (req,res){
    // res.send('Hello World');
    res.render('index');
});