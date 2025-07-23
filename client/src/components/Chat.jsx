import { useState, useRef, useEffect, useContext } from "react";
import {
  PaperAirplaneIcon,
  MicrophoneIcon,
  EllipsisVerticalIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/solid";
import socket from '../socket/socket.js';
import axios from "axios";
import { AuthContext } from "../context/authContext.jsx";
import { IoCheckmarkDone, IoCheckmark } from "react-icons/io5";

const Chat = ({ selectedChat, setSelectedChat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const { user } = useContext(AuthContext);
  const chatEndRef = useRef(null);

  const formatTime = (date) =>
    date ? new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }) : '';

  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/chat/${selectedChat._id}/messages`, {
          withCredentials: true,
        });
        setMessages(res.data);
      } catch (error) {
        console.error(error?.response?.data?.message || error.message);
      }
    };

    fetchMessages();
    socket.emit('mark-as-read', { chatId: selectedChat._id });

    const handleReceiveMessage = ({ chatId, message }) => {
      if (chatId === selectedChat._id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleUserTyping = ({ chatId }) => {
      if (chatId === selectedChat._id) setTyping(true);
    };

    const handleUserStoppedTyping = ({ chatId }) => {
      if (chatId === selectedChat._id) setTyping(false);
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('user-typing', handleUserTyping);
    socket.on('user-stopped-typing', handleUserStoppedTyping);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stopped-typing', handleUserStoppedTyping);
    };
  }, [selectedChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!selectedChat) return;

    if (e.target.value.trim() !== '') {
      socket.emit('typing', { chatId: selectedChat._id });
    } else {
      socket.emit("stop-typing", { chatId: selectedChat._id });
      setTyping(false);
    }
  };

  const handleBlur = () => {
    if (selectedChat) {
      socket.emit("stop-typing", { chatId: selectedChat._id });
      setTyping(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/chat/${selectedChat._id}/message`,
        { text: newMessage.trim() },
        { withCredentials: true },
      );
      socket.emit('send-message', {
        chatId: selectedChat._id,
        text: newMessage.trim(),
      });
      setNewMessage('');
      socket.emit("stop-typing", { chatId: selectedChat._id });
      setTyping(false);
    } catch (error) {
      console.error(error?.response?.data?.message || error.message);
    }
  };

  // Find chat partner for header
  let chatPartner = null;
  if (selectedChat && Array.isArray(selectedChat.participants)) {
    chatPartner = selectedChat.participants.find(p => p._id !== user._id);
  }

  if (!selectedChat) {
    return (
      <div className="flex items-center w-full justify-center h-screen bg-neutral-900 text-gray-500">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-neutral-900 text-gray-100">
      <div className="bg-neutral-800 flex items-center p-4 shadow-lg">
        <ArrowLeftIcon
          className="h-5 w-5 text-gray-300 mr-4 cursor-pointer"
          onClick={() => setSelectedChat(null)}
        />
        <img
          src={chatPartner?.profileImage}
          alt={chatPartner?.username}
          className="h-10 w-10 rounded-full border-2 border-sky-400 object-cover cursor-pointer"
        />
        <div className="ml-3 flex flex-col cursor-pointer">
          <h2 className="font-bold">{chatPartner?.username}</h2>
          {typing ?  (<div className="text-green-500 text-sm">Typing...</div>) : (<span className="text-sm text-gray-400">online</span>)}
        </div>
        <EllipsisVerticalIcon className="h-5 w-5 text-gray-300 ml-auto cursor-pointer" />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg, index) => {
          const senderId = typeof msg.sender === 'object' && msg.sender !== null ? msg.sender._id : msg.sender;
          return (
            <div
              key={index}
              className={`flex flex-col max-w-[60%] ${
                senderId === user._id
                  ? "ml-auto items-end"
                  : "mr-auto items-start"
              }`}
            >
              <div
                className={`flex ${
                  senderId === user._id ? "flex-row-reverse" : "flex-row"
                } items-end space-x-2`}
              >
                {senderId !== user._id && (
                  <img
                    src={chatPartner?.profileImage}
                    alt=""
                    className="h-8 w-8 rounded-full border-2 border-sky-400 object-cover cursor-pointer"
                  />
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 ${
                    senderId === user._id
                      ? "bg-sky-500 text-neutral-900"
                      : "bg-neutral-700 text-gray-100"
                  }`}
                >
                  <p>{msg.text}</p>
                  
                </div>
              </div>
              <div className="text-xs text-gray-400 flex items-center space-x-1 mt-1">
                <span>{formatTime(msg.createdAt)}</span>
                {senderId === user._id && (
                  msg.read ? <IoCheckmarkDone className="text-blue-500" size={15} /> : <IoCheckmark className="text-gray-300" size={15}  />
                )}
              </div>
            </div>
          );
        })}
        
        <div ref={chatEndRef}></div>
      </div>
      <form
        className="flex items-center space-x-3 p-4 border-0 bg-neutral-800"
        onSubmit={handleSendMessage}
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={handleTyping}
          onBlur={handleBlur}
          className="flex-1 rounded-full bg-neutral-700 text-gray-100 placeholder-gray-400 px-4 py-2 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full p-2 bg-sky-500 hover:bg-sky-600 flex items-center justify-center"
        >
          {newMessage.trim() === "" ? (
            <MicrophoneIcon className="h-5 w-5 text-neutral-900" />
          ) : (
            <PaperAirplaneIcon className="h-5 w-5 text-neutral-900" />
          )}
        </button>
      </form>
    </div>
  );
};

export default Chat;