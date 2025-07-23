const jwt =  require('jsonwebtoken');
const cookie = require('cookie')
const Chat = require('../models/Chat.js');

const onlineUsers = new Map();

export const registerSocketHandlers = (io) => {
  io.use((socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) return next(new Error("No cookie found"));

    const { jwt: token } = cookie.parse(cookieHeader);
    if (!token) return next(new Error("Unauthorized: no token"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      return next();
    } catch (err) {
      return next(new Error("Unauthorized: invalid token"));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;

    socket.join(user.id.toString());

    console.log("New user connected:", user.id);

    // Add user to online users map
    onlineUsers.set(user.id, { userId: user.id, username: user.username });
    io.emit('online_users', Array.from(onlineUsers.values()));

    //Notify others
    io.emit('user_connected', {
      userId: user.id,
      username: user.username
    });

    socket.on('typing', async ({ chatId }) => {
      const chat = await Chat.findById(chatId);
      if (!chat) return;

      chat.participants.forEach((userId) => {
        if (userId.toString() !== socket.user.id) {
          io.to(userId.toString()).emit('user-typing', {
            chatId,
            userId: socket.user.id,
          });
        }
      });
    });

    socket.on('stop-typing', async ({ chatId }) => {
      const chat = await Chat.findById(chatId);
      if (!chat) return;

      chat.participants.forEach((userId) => {
        if (userId.toString() !== socket.user.id) {
          io.to(userId.toString()).emit('user-stopped-typing', {
            chatId,
            userId: socket.user.id,
          });
        }
      });
    });

    // handle messages
    socket.on('send-message', async ({ chatId, text }) => {
      const chat = await Chat.findById(chatId);
      if(!chat) return;
      chat.participants.forEach((participantId) => {
        io.to(participantId.toString()).emit("receive-message", {
          chatId,
          message: {
            sender: user.id,
            text,
            createdAt: new Date(),
          },
        });
      });
    });

    

    socket.on('mark-as-read', async ({ chatId }) => {
      const chat = await Chat.findById(chatId);
      if (!chat) return;

      chat.messages.forEach((msg)=>{
        if (msg.sender.toString() !== socket.user.id) {
          msg.read = true;
        }
      });
      await chat.save();

      chat.participants.forEach((userId) => {
        if (userId.toString() !== socket.user.id) {
          io.to(userId.toString()).emit('messages-read', {
            chatId,
            userId: socket.user.id,
          });
        }
      });
    });

    socket.on('disconnect', () => {
      console.log(`${user.id} disconnected (${socket.id})`);
      onlineUsers.delete(user.id);
      io.emit('online_users', Array.from(onlineUsers.values()));
      io.emit("user_disconnected", {
        userId: user.id,
        username: user.username,
      });
    });

    });
};
