const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const { Server } = require("socket.io");
const ACTIONS = require('./Actions');

const server = http.createServer(app); // we created http server
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (for development)
    methods: ["GET", "POST"]
  }
});

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
    usersMap[socket.id] = { username, roomId };
    socket.join(roomId);
    console.log(`${username} joined room: ${roomId}`);
    const clients = getAllClients(roomId);
    console.log('Current clients in room:', clients);
    clients.forEach(({ socketId, user }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      })
    });
  }); // end of ACTIONS.JOIN

  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: usersMap[socket.id]?.username,
      });
    });
    delete usersMap[socket.id];
    socket.leave();
  }); // end of disconnecting

  // Code change - broadcast to all other clients in the room
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // Sync code - send current code to a specific client (when they join)
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });
  // Language change - broadcast to all other clients in the room
    socket.on(ACTIONS.LANGUAGE_CHANGE, ({ roomId, language }) => {
    socket.in(roomId).emit(ACTIONS.LANGUAGE_CHANGE, { language });
  });

  // Cursor change - broadcast cursor position to all other clients in the room
  socket.on(ACTIONS.CURSOR_CHANGE, ({ roomId, cursorPos }) => {
    const user = usersMap[socket.id];
    socket.in(roomId).emit(ACTIONS.CURSOR_CHANGE, {
      socketId: socket.id,
      username: user?.username,
      cursorPos,
    });
  });
  
}); // end of io.on connection

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});