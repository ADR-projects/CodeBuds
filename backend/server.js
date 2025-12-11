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

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});