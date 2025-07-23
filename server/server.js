const express = require('express');
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require('dotenv').config();
const cookieParser = require('cookie-parser');

const { registerSocketHandlers } = require('./socket/socket');
const authRoutes = require('./routes/authRoutes');
const chattRoutes = require('./routes/chatRoutes');
const dbConfig = require('./config/dbConfig');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT;

// socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

//middlewares
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

//connect to db
dbConfig();

app.get('/', (req, res) => {
  res.send("Real-Time Chat Application API");
});

app.use('/api/auth', authRoutes);
app.use('/api/chat', chattRoutes);

registerSocketHandlers(io);

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));


