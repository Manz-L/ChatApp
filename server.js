const path = require("path");
const http = require('http');
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require('./utils/messages')
const { user, userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')



const app = express();
const server = http.createServer(app);//
const io = socketio(server);//Telling Socket.IO to use that server to manage WebSocket connections.


//Set Static Folder / Initializing middleware for authenticationor logging
app.use(express.static(path.join(__dirname,'public')));

const botname = 'Chatbot';

const PORT = process.env.PORT || 3000;
//server handles http requests
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//io handles websockets
// Run When A Client Connects


io.on('connection', socket =>{
    socket.on('joinRoom', ({username,room}) => {

        
        const user = userJoin(socket.id,username,room);
        socket.join(user.room);


        socket.emit('message', formatMessage(botname,'Welcome To Chat'));

        //Brodcast When user Connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botname,`${user.username} Joined The Chat`));// to all the other clients and io.emit("blabla") to all clients including you

        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        });


    });
    
    //Listen for ChatMessage
    socket.on('chatMessage', (msg)=>{
        console.log("Message received on server:", msg); 
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message',formatMessage(user.username,msg));
        
    });

    //Runs When Client Disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user){
            io.to(user.room).emit('message', formatMessage( botname,`${user.username} has left the chat`));

        }
        
    });

});


