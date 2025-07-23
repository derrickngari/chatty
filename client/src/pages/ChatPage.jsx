import { useState, useEffect, useContext } from "react";
import SideBar from "../components/SideBar";
import Chat from "../components/Chat";
import MobileChatList from "../components/MobileChatList";
import { AuthContext } from "../context/authContext";
import axios from 'axios';
import ErrorBoundary from "../components/ErrorBoundary";
import socket from '../socket/socket';

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/chat/user-chats`, {
          withCredentials: true,
        });
        setChats(res.data);
      } catch (error) {
        console.log(error?.response?.data?.message);
      }
    };
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/auth/users`, {
          withCredentials: true,
        });
        setUsers(res.data);
      } catch (error) {
        console.log(error?.response?.data?.message);
      }
    };
    if (user) {
      fetchChats();
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    socket.on('online_users', (users) => {
      setOnlineUsers(users);
    });
    return () => {
      socket.off('online_users');
    };
  }, []);

  const handleUserClick = async (otherUser) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/chat/direct/${otherUser._id}`,
        { withCredentials: true }
      );
      const chat = res.data;
      // Add chat to chats if not already present
      setChats(prev => {
        if (!prev.some(c => c._id === chat._id)) {
          return [...prev, chat];
        }
        return prev;
      });
      setSelectedChat(chat);
    } catch (error) {
      console.log(error?.response?.data?.message);
    }
  };

  const groups = chats.filter(c => c.isGroup);

  return (
    <div className="flex bg-neutral-800 h-screen text-gray-200">
      <div className="hidden md:flex w-64 flex-col border-r border-gray-700">
        <ErrorBoundary>
          <SideBar onSelectedChat={setSelectedChat} chats={chats} users={users} groups={groups} onlineUsers={onlineUsers} />
        </ErrorBoundary>
      </div>
      <div className="hidden md:flex flex-1">
        <Chat selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
      </div>
      <div className="md:hidden flex-1">
        {selectedChat ? (
          <Chat selectedChat={selectedChat} setSelectedChat={setSelectedChat} />
        ) : (
          <MobileChatList 
            chats={chats} 
            user={user} 
            onSelectChat={setSelectedChat} 
            onlineUsers={onlineUsers} 
            users={users} 
            groups={groups} 
            onUserClick={handleUserClick}
          />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
