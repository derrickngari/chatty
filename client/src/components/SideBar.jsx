import { useState, useContext } from "react";
import {
  ArrowRightEndOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { AuthContext } from "../context/authContext"; 
import { logout } from "../srevices/authServices"; 

const SideBar = ({ onSelectedChat, chats, onlineUsers = [], users = [], groups = [] }) => {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState('chats');
  const { user, setUser } = useContext(AuthContext);
  console.log(user)

  // Filter chats based on search (works for both direct and group chats)
  const searchedChats = chats.filter((chat) => {
    if (chat.isGroup) {
      return chat.groupName?.toLowerCase().includes(search.toLowerCase());
    } else {
      const otherUser = chat.participants.find((p) => p._id !== user._id);
      return otherUser && otherUser.username && otherUser.username.toLowerCase().includes(search.toLowerCase());
    }
  });

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      setUser(null);
      window.location.href = "/login"; 
    } catch (error) {
      console.error(error?.res?.data?.message || error.message || "Something went wrong");
    }
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-neutral-800 text-gray-100 p-4 border-r border-gray-700 h-full">
      {/* Toggle Buttons */}
      <div className="flex space-x-2 mb-3">
        <button onClick={() => setTab('users')} className={`flex-1 py-2 rounded ${tab === 'users' ? 'bg-sky-500 text-white' : 'bg-neutral-700 text-gray-300'}`}>Users</button>
        <button onClick={() => setTab('chats')} className={`flex-1 py-2 rounded ${tab === 'chats' ? 'bg-sky-500 text-white' : 'bg-neutral-700 text-gray-300'}`}>Chats</button>
        <button onClick={() => setTab('groups')} className={`flex-1 py-2 rounded ${tab === 'groups' ? 'bg-sky-500 text-white' : 'bg-neutral-700 text-gray-300'}`}>Groups</button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        className="rounded-full bg-neutral-700 text-gray-100 placeholder-gray-400 px-4 py-2 focus:outline-none mt-1"
        placeholder={`Search ${tab}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex-1 overflow-y-auto mt-4 space-y-3 scrollbar-hide">
        {tab === 'users' && (
          users.length > 0 ? (
            users.filter(u => u._id !== user._id && u.username && u.username.toLowerCase().includes(search.toLowerCase())).map(u => (
              <div key={u._id} className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-neutral-700">
                <img src={u.profileImage} alt={u.username || 'User'} className="h-10 w-10 rounded-full border-2 border-sky-400 object-cover" />
                <div className="flex flex-col">
                  <span className="font-bold">{u.username || 'Unknown'}</span>
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
                : (otherUser && otherUser.username) ? otherUser.username : 'Unknown';
              const displayAvatar = chat.isGroup
                ? "https://via.placeholder.com/40?text=G"
                : (otherUser && otherUser.profileImage) ? otherUser.profileImage : "https://via.placeholder.com/40?text=U";
              const status = chat.isGroup
                ? "Group Chat"
                : onlineUsers.some(ou => ou.userId === otherUser?._id) ? 'online' : 'offline';
              return (
                <div
                  key={chat._id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer 
                    ${selectedChatId === chat._id ? "bg-neutral-700 border-1 border-sky-500" : "hover:bg-neutral-700"}`}
                  onClick={() => {
                    setSelectedChatId(chat._id);
                    onSelectedChat?.(chat);
                  }}
                >
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="h-10 w-10 rounded-full border-2 border-sky-400 object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold">{displayName}</span>
                    <span className={`text-sm ${chat.isGroup ? "text-yellow-400" : status === 'online' ? 'text-green-400' : 'text-gray-400'}`}>{status}</span>
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

      {/* Current User Info at the bottom */}
      <div className="mt-4 pt-4 border-t border-gray-700 flex flex-col gap-2">
        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-700 cursor-pointer">
          <img
            src={user.profileImage}
            alt={user.fullName}
            className="h-10 w-10 rounded-full border-2 border-sky-400 object-cover"
          />
          <div className="flex flex-col">
            <span>{user.username}</span>
            <span className="text-sm text-green-400">online</span>
          </div>
        </div>

        <button
          className="flex items-center space-x-3 p-3 gap-3 rounded-lg text-red-500 hover:bg-neutral-700 cursor-pointer"
          onClick={handleLogout}
        >
          <ArrowRightEndOnRectangleIcon className="h-5 w-5 text-red-500" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default SideBar;
