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

const usersMap = {};   // { socketId: { username, roomId } }
const roomsMap = {};   // { roomId: { hostSocketId, hostUsername } }

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
    
    // Handle host assignment
    if (!roomsMap[roomId]) {
      // First member becomes host (new room)
      roomsMap[roomId] = { hostSocketId: socket.id, hostUsername: username };
      console.log(`${username} is now the host of room: ${roomId}`);
    } else if (roomsMap[roomId].hostUsername === username) {
      // Returning host (e.g., page refresh) - restore their host status
      roomsMap[roomId].hostSocketId = socket.id;
      console.log(`${username} (host) reconnected to room: ${roomId}`);
    } else if (!roomsMap[roomId].hostSocketId) {
      // Room exists but host left - this person becomes new host
      roomsMap[roomId].hostSocketId = socket.id;
      roomsMap[roomId].hostUsername = username;
      console.log(`${username} is now the host of room: ${roomId} (previous host gone)`);
    }
    
    console.log(`${username} joined room: ${roomId}`);
    const clients = getAllClients(roomId);
    const hostSocketId = roomsMap[roomId]?.hostSocketId;
    
    console.log('Current clients in room:', clients);
    clients.forEach(({ socketId, user }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
        hostSocketId, // Include host info
      })
    });
  }); // end of ACTIONS.JOIN

  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];
    const user = usersMap[socket.id];
    
    rooms.forEach((roomId) => {
      // Check if disconnecting user is the host
      if (roomsMap[roomId]?.hostSocketId === socket.id) {
        const clients = getAllClients(roomId);
        // Find next member to become host (excluding current user)
        const nextHost = clients.find(c => c.socketId !== socket.id);
        
        if (nextHost) {
          roomsMap[roomId].hostSocketId = nextHost.socketId;
          roomsMap[roomId].hostUsername = nextHost.user?.username;
          // Notify all remaining members about new host
          socket.in(roomId).emit(ACTIONS.HOST_CHANGED, {
            newHostSocketId: nextHost.socketId,
            newHostUsername: nextHost.user?.username,
          });
          console.log(`Host transferred to ${nextHost.user?.username} in room: ${roomId}`);
        } else {
          // Room will be empty - keep hostUsername for reconnection grace period
          // Clear hostSocketId but keep the room data for potential reconnect
          roomsMap[roomId].hostSocketId = null;
          console.log(`Room ${roomId} is empty, keeping host info for ${roomsMap[roomId].hostUsername} in case of reconnect`);
          
          // Clean up after 30 seconds if no one rejoins
          setTimeout(() => {
            const room = io.sockets.adapter.rooms.get(roomId);
            if (!room || room.size === 0) {
              delete roomsMap[roomId];
              console.log(`Room ${roomId} cleaned up after timeout`);
            }
          }, 30000);
        }
      }
      
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: user?.username,
      });
    });
    delete usersMap[socket.id];
    socket.leave();
  }); // end of disconnecting

  // Code change - broadcast to all other clients in the room
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  // Sync code and language - send current state to a specific client (when they join)
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code, language }) => {
    // Send language FIRST so editor recreates with correct language mode
    // Then send code to update the content
    if (language) {
      io.to(socketId).emit(ACTIONS.LANGUAGE_CHANGE, { language });
    }
    // Small delay to ensure language change is processed first
    setTimeout(() => {
      io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    }, 50);
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

  // Check if room exists (has at least one client)
  socket.on(ACTIONS.ROOM_EXISTS, ({ roomId }, callback) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    const exists = room && room.size > 0;
    callback({ exists });
  });

  // Kick user - only host can kick
  socket.on(ACTIONS.KICK_USER, ({ roomId, targetSocketId }) => {
    // Verify the sender is the host
    if (roomsMap[roomId]?.hostSocketId !== socket.id) {
      console.log('Kick attempt by non-host rejected');
      return;
    }
    
    const targetUser = usersMap[targetSocketId];
    if (!targetUser) return;
    
    // Notify the kicked user
    io.to(targetSocketId).emit(ACTIONS.USER_KICKED, {
      kickedBy: usersMap[socket.id]?.username,
    });
    
    // Remove from room
    const targetSocket = io.sockets.sockets.get(targetSocketId);
    if (targetSocket) {
      targetSocket.leave(roomId);
    }
    
    // Notify others
    socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
      socketId: targetSocketId,
      username: targetUser?.username,
    });
    
    // Also emit to the kicker (host) so their client list updates
    socket.emit(ACTIONS.DISCONNECTED, {
      socketId: targetSocketId,
      username: targetUser?.username,
    });
    
    delete usersMap[targetSocketId];
    console.log(`${targetUser?.username} was kicked from room: ${roomId}`);
  });
  
}); // end of io.on connection

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});