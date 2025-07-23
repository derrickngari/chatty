import express from 'express';
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import 'dotenv/config';
import cookieParser from 'cookie-parser'

import { registerSocketHandlers } from './socket/socket.js';
import authRoutes from './routes/authRoutes.js';
import chattRoutes from './routes/chatRoutes.js';
import dbConfig from './config/dbConfig.js';

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


