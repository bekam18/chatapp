import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import UserList from './UserList';
import GroupChat from './GroupChat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { usersAPI, messagesAPI, groupsAPI } from '../services/api';
import './Chat.css';

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [chatMode, setChatMode] = useState('private'); // 'private' or 'group'
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);

  const { user, logout } = useAuth();
  const { 
    connected, 
    onlineUsers, 
    messages, 
    setMessages, 
    joinConversation, 
    leaveConversation,
    joinGroup,
    leaveGroup,
    sendMessage,
    sendGroupMessage,
    isUserOnline,
    getTypingUsers
  } = useSocket();

  // Load users and conversations on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load all users
        const usersResponse = await usersAPI.getUsers();
        setUsers(usersResponse.data.data.users);

        // Load conversations
        const conversationsResponse = await messagesAPI.getConversations();
        setConversations(conversationsResponse.data.data.conversations);

      } catch (error) {
        console.error('Failed to load initial data:', error);
        setError('Failed to load chat data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load messages when a user is selected
  useEffect(() => {
    const loadMessages = async (userId) => {
      try {
        const response = await messagesAPI.getMessages(userId);
        setMessages(response.data.data.messages);
      } catch (error) {
        console.error('Failed to load messages:', error);
        setError('Failed to load messages');
      }
    };

    const loadGroupMessages = async (groupId) => {
      try {
        console.log('🔍 Loading group messages for group:', groupId);
        console.log('🔍 API URL will be:', `/api/groups/${groupId}/messages`);
        
        const response = await groupsAPI.getGroupMessages(groupId);
        console.log('✅ Group messages response:', response);
        console.log('✅ Group messages data:', response.data);
        console.log('✅ Messages array:', response.data.data.messages);
        
        setMessages(response.data.data.messages);
      } catch (error) {
        console.error('❌ Failed to load group messages:', error);
        console.error('❌ Error response:', error.response);
        console.error('❌ Error details:', error.response?.data);
        console.error('❌ Error status:', error.response?.status);
        setError('Failed to load group messages');
      }
    };

    if (selectedUser && chatMode === 'private') {
      loadMessages(selectedUser.id);
      joinConversation(selectedUser.id);
      setSidebarOpen(false);
    } else if (selectedGroup && chatMode === 'group') {
      loadGroupMessages(selectedGroup.id);
      joinGroup(selectedGroup.id);
      setSidebarOpen(false);
    }

    return () => {
      if (selectedUser && chatMode === 'private') {
        leaveConversation(selectedUser.id);
      } else if (selectedGroup && chatMode === 'group') {
        leaveGroup(selectedGroup.id);
      }
    };
  }, [selectedUser, selectedGroup, chatMode, joinConversation, leaveConversation, joinGroup, leaveGroup, setMessages]);



  const handleUserSelect = (selectedUser) => {
    setSelectedUser(selectedUser);
    setSelectedGroup(null);
    setChatMode('private');
    setError(null);
  };

  const handleGroupSelect = (selectedGroup) => {
    setSelectedGroup(selectedGroup);
    setSelectedUser(null);
    setChatMode('group');
    setError(null);
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    console.log('🚀 Sending message:', { message, chatMode, selectedUser, selectedGroup });

    try {
      if (chatMode === 'private' && selectedUser) {
        console.log('📤 Sending private message to user:', selectedUser.id);
        // Send private message
        sendMessage(selectedUser.id, message);
        await messagesAPI.sendMessage(selectedUser.id, message);
        console.log('✅ Private message sent successfully');
      } else if (chatMode === 'group' && selectedGroup) {
        console.log('📤 Sending group message to group:', selectedGroup.id);
        // Send group message
        sendGroupMessage(selectedGroup.id, message);
        await groupsAPI.sendGroupMessage(selectedGroup.id, message);
        console.log('✅ Group message sent successfully');
      } else {
        console.log('❌ No valid recipient selected');
        setError('No recipient selected');
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      console.error('❌ Error details:', error.response?.data);
      setError('Failed to send message');
    }
  };

  const handleSendMedia = async (fileInfo) => {
    try {
      if (chatMode === 'private' && selectedUser) {
        // Send private media message
        const mediaMessage = fileInfo.originalName || 'Media file';
        sendMessage(selectedUser.id, mediaMessage, 'media');
        await messagesAPI.sendMessage(selectedUser.id, mediaMessage, 'media');
      } else if (chatMode === 'group' && selectedGroup) {
        // Send group media message
        const mediaMessage = fileInfo.originalName || 'Media file';
        sendGroupMessage(selectedGroup.id, mediaMessage, 'media');
        await groupsAPI.sendGroupMessage(selectedGroup.id, mediaMessage, 'media');
      }
    } catch (error) {
      console.error('Failed to send media:', error);
      setError('Failed to send media');
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      try {
        const response = await usersAPI.searchUsers(query);
        setUsers(response.data.data.users);
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      // Reset to all users
      try {
        const response = await usersAPI.getUsers();
        setUsers(response.data.data.users);
      } catch (error) {
        console.error('Failed to reload users:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getConnectionStatus = () => {
    if (connected) {
      return { status: 'Connected', className: 'connected' };
    }
    return { status: 'Disconnected', className: 'disconnected' };
  };

  const connectionStatus = getConnectionStatus();
  const typingUsers = selectedUser ? getTypingUsers(selectedUser.id) : [];

  if (loading) {
    return (
      <div className="chat-loading">
        <div className="loading-spinner"></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Header */}
      <header className="chat-header">
        <div className="header-left">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1>Chat App</h1>
        </div>
        
        <div className="header-center">
          {selectedUser && chatMode === 'private' && (
            <div className="selected-user-info">
              <span className="selected-user-name">{selectedUser.username}</span>
              <span className={`user-status ${isUserOnline(selectedUser.id) ? 'online' : 'offline'}`}>
                {isUserOnline(selectedUser.id) ? 'Online' : 'Offline'}
              </span>
            </div>
          )}
          {selectedGroup && chatMode === 'group' && (
            <div className="selected-user-info">
              <span className="selected-user-name">{selectedGroup.name}</span>
              <span className="user-status">
                {selectedGroup.member_count} members
              </span>
            </div>
          )}
        </div>

        <div className="header-right">
          <div className="chat-mode-toggle">
            <button
              className={`mode-btn ${!showGroupChat ? 'active' : ''}`}
              onClick={() => setShowGroupChat(false)}
            >
              Private
            </button>
            <button
              className={`mode-btn ${showGroupChat ? 'active' : ''}`}
              onClick={() => setShowGroupChat(true)}
            >
              Groups
            </button>
          </div>
          <div className={`connection-status ${connectionStatus.className}`}>
            {connectionStatus.status}
          </div>
          <div className="user-menu">
            <span className="current-user">{user?.username}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="chat-body">
        {/* Sidebar */}
        <aside className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
          {!showGroupChat ? (
            <UserList
              users={users}
              onlineUsers={onlineUsers}
              selectedUser={selectedUser}
              onUserSelect={handleUserSelect}
              onSearch={handleSearch}
              searchQuery={searchQuery}
              conversations={conversations}
            />
          ) : (
            <GroupChat
              selectedGroup={selectedGroup}
              onGroupSelect={handleGroupSelect}
            />
          )}
        </aside>

        {/* Main Chat Area */}
        <main className="chat-main">
          {error && (
            <div className="error-banner">
              {error}
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {(selectedUser && chatMode === 'private') || (selectedGroup && chatMode === 'group') ? (
            <>
              <MessageList
                messages={messages}
                currentUser={user}
                selectedUser={selectedUser}
                selectedGroup={selectedGroup}
                chatMode={chatMode}
                typingUsers={typingUsers}
              />
              <MessageInput
                onSendMessage={handleSendMessage}
                onSendMedia={handleSendMedia}
                disabled={!connected}
                placeholder={
                  connected 
                    ? chatMode === 'private' 
                      ? `Message ${selectedUser?.username}...`
                      : `Message ${selectedGroup?.name}...`
                    : 'Connecting...'
                }
              />
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-content">
                <h2>Welcome to Chat App</h2>
                <p>
                  {showGroupChat 
                    ? 'Select a group from the sidebar to start chatting'
                    : 'Select a user from the sidebar to start chatting'
                  }
                </p>
                <div className="chat-features">
                  <div className="feature">
                    <span className="feature-icon">💬</span>
                    <span>Real-time messaging</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">👥</span>
                    <span>Group chats</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">😊</span>
                    <span>Message reactions</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">✏️</span>
                    <span>Edit & delete messages</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Chat;