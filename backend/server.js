// backend/server.js
// backend/server.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/boards');
const cardRoutes = require('./routes/cards');

connectDB();

const app = express();
const server = http.createServer(app);

// Dynamic allowed origins
const allowedOrigins = [
  'https://smart-trello.vercel.app',
  'https://smart-trello.onrender.com',
  'http://localhost:5173', // for local dev
  'http://localhost:3000'
];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }
});

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/cards', cardRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

io.on('connection', (socket) => {
  socket.on('joinBoard', (boardId) => {
    socket.join(boardId);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));