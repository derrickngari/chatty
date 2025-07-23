const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getUserChats,
  getMessages,
  createNewChat,
  createNewGroup,
  sendMessage,
  getOrCreateChat,
} = require("../controllers/chatControllers");

router.get('/user-chats', authMiddleware, getUserChats);
router.get('/:chatId/messages', authMiddleware, getMessages);
router.post('/:chatId/message', authMiddleware, sendMessage);
router.post('/', authMiddleware, createNewChat);
router.post('/new-group', authMiddleware, createNewGroup);
router.get('/direct/:userId', authMiddleware, getOrCreateChat);

module.exports = router;