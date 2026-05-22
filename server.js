const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

// Database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurant', require('./routes/restaurant'));
app.use('/api/customer', require('./routes/customer'));
app.use('/api/delivery', require('./routes/delivery'));

// Socket.io for Real-Time Tracking
io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  socket.on('joinOrder', (orderId) => {
    socket.join(orderId);
  });

  socket.on('updateLocation', (data) => {
    const { orderId, location } = data;
    io.to(orderId).emit('locationUpdate', location);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
