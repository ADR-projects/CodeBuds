const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const { Server } = require("socket.io");
const ACTIONS = require('../client/src/Actions');

const server = http.createServer(app); // we created http server
const io = new Server(server);

app.get('/', (req, res) => {
  res.send('Hello from Codebuds backend!');
});

// app.use(express.static('build'));
// app.use((req, res, next) => {
//     res.sendFile(path.join(__dirname,'build' 'index.html'));
// });

const PORT = process.env.PORT || 5000;

const usersMap = {};
const getAllClients = (roomId) => {
  // here we get a map of room's clients using roomId, then make it an array and map through it
  // we map the id with the username stored in usersMap
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
    return {
      socketId, 
      user: usersMap[socketId]    
    }
  })
}

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    usersMap[socket.id] = {username};
    socket.join(roomId);
    console.log(`${username} joined room: ${roomId}`);
    const clients = getAllClients(roomId);
    console.log('Current clients in room:', clients);
  });

  // socket.on('disconnect', () => {
  //   console.log('Client disconnected:', socket.id);
  // });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});