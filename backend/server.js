const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

let busPositions = {};
let driverSockets = {};

// Supprime les bus inactifs depuis plus de 10 secondes
setInterval(() => {
  const now = new Date();
  let changed = false;
  Object.keys(busPositions).forEach((busId) => {
    const diff = (now - new Date(busPositions[busId].timestamp)) / 1000;
    if (diff > 60) {
      delete busPositions[busId];
      changed = true;
      console.log(`Bus ${busId} supprimé - inactif`);
    }
  });
  if (changed) {
    io.emit('buses:update', busPositions);
  }
}, 2000);

io.on('connection', (socket) => {
  console.log('Connexion établie:', socket.id);
socket.on('ping', () => {
  socket.emit('pong');
});
  socket.on('driver:position', (data) => {
    busPositions[data.busId] = {
      busId: data.busId,
      busName: data.busName,
      lat: data.lat,
      lng: data.lng,
      timestamp: new Date()
    };
    driverSockets[socket.id] = data.busId;
    io.emit('buses:update', busPositions);
  });

  socket.on('driver:stop', (data) => {
    if (data.busId && busPositions[data.busId]) {
      delete busPositions[data.busId];
      delete driverSockets[socket.id];
      io.emit('buses:update', busPositions);
    }
  });

  socket.on('disconnect', () => {
    const busId = driverSockets[socket.id];
    if (busId) {
      delete busPositions[busId];
      delete driverSockets[socket.id];
      io.emit('buses:update', busPositions);
      console.log(`Bus ${busId} supprimé - chauffeur déconnecté`);
    }
  });
});

app.get('/api/buses', (req, res) => {
  res.json(busPositions);
});

app.get('/', (req, res) => {
  res.send('CAU Bus Tracker API fonctionne !');
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});