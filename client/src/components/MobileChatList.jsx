import React, { useContext, useEffect, useState } from "react";
import { EllipsisVerticalIcon, MagnifyingGlassIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { Link, useNavigate } from "react-router-dom";
import socket from "../socket/socket";
const MobileChatList = ({ chats, onSelectChat, user, onlineUsers = [], users = [], groups = [], onUserClick }) => {
  const [chatList, setChatList] = useState(chats);
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [tab, setTab] = useState('chats');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setChatList(chats);
  }, [chats]);

  useEffect(() => {
    socket.on("chat-updated", ({ chatId, lastMessage }) => {
      setChatList((prev) =>
        prev.map((chat) =>
          chat._id === chatId
            ? { ...chat, lastMessage, updatedAt: new Date() }
            : chat
        )
      );
    });
    return () => {
      socket.off("chat-updated");
    };
  }, []);

  const searchedChats = chatList.filter((chat) => {
    if (chat.isGroup) {
      return chat.groupName?.toLowerCase().includes(search.toLowerCase());
    } else {
      const otherUser = chat.participants.find((p) => p._id !== user._id);
      return otherUser?.username.toLowerCase().includes(search.toLowerCase());
    }
  });

  return (
    <div className="flex flex-col h-screen bg-neutral-800 text-gray-100 p-4">
      
      <div className="flex items-center justify-between border-b border-gray-600">
        
        <div className="relative items-center mb-3">
        <div className=" absolute rounded-full bg-green-500 size-2.5 shadow-2xl top-0 right-0"></div>
        <img src={user.profileImage} className="h-10 w-10 rounded-full border-2 border-sky-400 object-cover cursor-pointer" alt="" />
        </div>
      <div className="flex space-x-2 items-center mx-auto mb-3">
          <button onClick={() => setTab('users')} className={` py-2 px-4 rounded ${tab === 'users' ? 'bg-sky-500 text-white' : 'bg-neutral-700 text-gray-300'}`}>Users</button>
          <button onClick={() => setTab('chats')} className={`py-2 px-4 rounded ${tab === 'chats' ? 'bg-sky-500 text-white' : 'bg-neutral-700 text-gray-300'}`}>Chats</button>
          <button onClick={() => setTab('groups')} className={`py-2 px-4 rounded ${tab === 'groups' ? 'bg-sky-500 text-white' : 'bg-neutral-700 text-gray-300'}`}>Groups</button>
        </div>
        <span className="flex justify-between items-center space-x-2 ml-2 mb-3">
          <button
            className="rounded-full p-2 hover:bg-gray-600 flex items-center justify-center"
            onClick={() => setIsSearching(!isSearching)}
          >
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-300 cursor-pointer" />
          </button>
          <div className="relative">
          <button className="rounded-full p-2 hover:bg-gray-600 flex items-center justify-center" onClick={()=> setOpen(!open)}>
            <EllipsisVerticalIcon className="h-6 w-6 text-gray-300 cursor-pointer" />
          </button>
            {open && <div className=" flex flex-col gap-2 absolute top-10 right-0 bg-neutral-900 px-3 items-center rounded py-3 w-[200px]">
              <span className="text-gray-400 w-full px-4 flex items-center justify-between hover:bg-neutral-700 cursor-pointer rounded-lg py-2"
              onClick={()=> navigate('/profile')}>
              <div>
              {user.fullName}
              <p className="text-xs text-green-500">online</p>
              </div>
              <ChevronRightIcon className="h-6 w-6 text-gray-300 cursor-pointer" />
              </span>
              <button className="flex items-center space-x-3 py-2 px-4 w-full rounded-lg text-red-500 hover:bg-red-900">Logout</button>
            </div>}
          </div>
        </span>
      </div>

      {isSearching && (
        <input
          type="text"
          placeholder={`Search ${tab}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-full bg-neutral-700 text-gray-100 placeholder-gray-400 px-4 py-2 focus:outline-none mt-3"
        />
      )}

      <div className="flex-1 mt-4 space-y-3 scrollbar-hide overflow-y-auto">
        {tab === 'users' && (
          users.length > 0 ? (
            users.filter(u => u._id !== user._id && u.username && u.username.toLowerCase().includes(search.toLowerCase())).map(u => (
              <div key={u._id} className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-neutral-700" onClick={() => onUserClick && onUserClick(u)}>
                <img src={u.profileImage} alt={u.username} className="h-10 w-10 rounded-full border-2 border-sky-400 object-cover" />
                <div className="flex flex-col">
                  <span className="font-bold">{u.username}</span>
                  <span className={`text-sm ${onlineUsers.some(ou => ou.userId === u._id) ? 'text-green-400' : 'text-gray-400'}`}>{onlineUsers.some(ou => ou.userId === u._id) ? 'online' : 'offline'}</span>
                </div>
              </div>
            ))
          ) : <p className="text-gray-500 text-center mt-4">No users found</p>
        )}
        {tab === 'chats' && (
          searchedChats.length > 0 ? (
            searchedChats.map((chat) => {
              const otherUser = !chat.isGroup
                ? chat.participants.find((p) => p._id !== user._id)
                : null;
              const displayName = chat.isGroup
                ? chat.groupName
                : otherUser?.username;
              const displayAvatar = chat.isGroup
                ? "https://via.placeholder.com/40?text=G"
                : otherUser?.profileImage;
              const status = chat.isGroup
                ? "Group Chat"
                : (onlineUsers.some(ou => ou.userId === otherUser?._id) ? "online" : "offline");
              return (
                <div
                  key={chat._id}
                  onClick={() => onSelectChat(chat)}
                  className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-neutral-700"
                >
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="h-10 w-10 rounded-full border-2 border-sky-400 object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold">{displayName}</span>
                    <span className={`text-sm ${chat.isGroup ? "text-yellow-400" : status === "online" ? "text-green-400" : "text-gray-400"}`}>{status}</span>
                  </div>
                </div>
              );
            })
          ) : <p className="text-gray-500 text-center mt-4">No chats found</p>
        )}
        {tab === 'groups' && (
          groups.length > 0 ? (
            groups.filter(g => g.groupName?.toLowerCase().includes(search.toLowerCase())).map(g => (
              <div key={g._id} className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-neutral-700">
                <img src="https://via.placeholder.com/40?text=G" alt={g.groupName} className="h-10 w-10 rounded-full border-2 border-sky-400 object-cover" />
                <div className="flex flex-col">
                  <span className="font-bold">{g.groupName}</span>
                  <span className="text-sm text-yellow-400">Group Chat</span>
                </div>
              </div>
            ))
          ) : <p className="text-gray-500 text-center mt-4">No groups found</p>
        )}
      </div>
    </div>
  );
};

export default MobileChatList;
