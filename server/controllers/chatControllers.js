import Chat from "../models/Chat.js";
import mongoose from 'mongoose';

export const getUserChats = async (req, res) => {
  try {
    const id = req.user.id;
    if (!id)
      return res.status(401).json({ message: "Unauthorized! Please login." });
    const chats = await Chat.find({ participants: id })
      .populate("participants", "username profileImage")
      .populate('messages.sender', 'username profileImage');
    if (!chats) return res.status(404).json({ message: "No chats found." });
    return res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const chat = await Chat.findById(chatId).populate('messages.sender', 'username profileImage');
    if (!chat) return res.status(404).json({ message: "No chat found." });
    const messages = chat.messages;
    return res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createNewChat = async (req, res) => {
  try {
    const { participants } = req.body;
    if (participants.length < 2)
      return res.status(400).json({ message: "At least two participants required to create a chat." });
    // Check for existing chat
    let chat = await Chat.findOne({
      isGroup: false,
      participants: { $all: participants, $size: 2 }
    }).populate("participants", "username profileImage");
    if (!chat) {
      chat = await Chat.create({ participants });
      chat = await Chat.findById(chat._id).populate("participants", "username profileImage");
    }
    return res.status(201).json({ message: "Chat created successfully.", chat });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOrCreateChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    let chat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [currentUserId, userId], $size: 2 }
    }).populate("participants", "username profileImage");
    if (!chat) {
      chat = await Chat.create({ participants: [currentUserId, userId] });
      chat = await Chat.findById(chat._id).populate("participants", "username profileImage");
    }
    return res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createNewGroup = async (req, res) => {
  try {
    const { participants, groupName } = req.body;
    const chat = await Chat.create({
      participants,
      groupName,
      isGroup: true,
      messages: [],
    });
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  const { chatId } = req.params;
  const { text } = req.body;
  try {
    const chat = await Chat.findById(chatId);
    if(!chat) return res.status(404).json({ message: "No chat found." });

    const newMessage = {
      sender: req.user._id,
      text
    };

    chat.messages.push(newMessage);
    await chat.save();
    // Populate sender for the last message
    const populatedMessage = await Chat.findById(chatId)
      .populate('messages.sender', 'username profileImage')
      .then(c => c.messages[c.messages.length - 1]);

    return res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
