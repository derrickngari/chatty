import express from "express";
const router = express.Router();
import authMiddleware from "../middlewares/authMiddleware.js";
import { getUserChats, getMessages, createNewChat, createNewGroup, sendMessage, getOrCreateChat } from "../controllers/chatControllers.js";

router.get('/user-chats', authMiddleware, getUserChats);
router.get('/:chatId/messages', authMiddleware, getMessages);
router.post('/:chatId/message', authMiddleware, sendMessage);
router.post('/', authMiddleware, createNewChat);
router.post('/new-group', authMiddleware, createNewGroup);
router.get('/direct/:userId', authMiddleware, getOrCreateChat);

export default router;