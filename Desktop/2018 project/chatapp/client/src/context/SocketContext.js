import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
      
      // Create socket connection
      const newSocket = io(SERVER_URL, {
        auth: {
          token
        },
        transports: ['websocket', 'polling']
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('✅ Connected to server');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Disconnected from server');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setConnected(false);
      });

      // User status events
      newSocket.on('onlineUsers', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('userStatusUpdate', (userData) => {
        setOnlineUsers(prev => {
          if (userData.status === 'online') {
            // Add user if not already in list
            const exists = prev.find(u => u.userId === userData.userId);
            if (!exists) {
              return [...prev, userData];
            }
            return prev;
          } else {
            // Remove user from online list
            return prev.filter(u => u.userId !== userData.userId);
          }
        });
      });

      // Message events
      newSocket.on('receiveMessage', (message) => {
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('receiveGroupMessage', (message) => {
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('newMessage', (message) => {
        // Handle new message notification (for messages in other conversations)
        console.log('New message received:', message);
      });

      newSocket.on('messageError', (error) => {
        console.error('Message error:', error);
      });

      newSocket.on('messageEdited', (data) => {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, message: data.newMessage, is_edited: true, edited_at: data.editedAt }
            : msg
        ));
      });

      newSocket.on('messageDeleted', (data) => {
        setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
      });

      // Reaction events
      newSocket.on('reactionUpdate', (data) => {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, reactions: data.reactions }
            : msg
        ));
      });

      newSocket.on('reactionError', (error) => {
        console.error('Reaction error:', error);
      });

      // Typing events
      newSocket.on('userTyping', ({ userId, username, isTyping }) => {
        setTypingUsers(prev => ({
          ...prev,
          [userId]: isTyping ? { username, isTyping } : undefined
        }));

        // Clear typing indicator after 3 seconds
        if (isTyping) {
          setTimeout(() => {
            setTypingUsers(prev => ({
              ...prev,
              [userId]: undefined
            }));
          }, 3000);
        }
      });

      newSocket.on('messagesRead', (data) => {
        console.log('Messages read by:', data.readByUsername);
        // Update message read status in UI if needed
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  // Socket helper functions
  const joinConversation = (otherUserId) => {
    if (socket) {
      socket.emit('joinConversation', { otherUserId });
    }
  };

  const leaveConversation = (otherUserId) => {
    if (socket) {
      socket.emit('leaveConversation', { otherUserId });
    }
  };

  const sendMessage = (receiverId, message, messageType = 'text') => {
    if (socket && message.trim()) {
      socket.emit('sendMessage', {
        receiverId,
        message: message.trim(),
        messageType
      });
    }
  };

  const sendGroupMessage = (groupId, message, messageType = 'text', replyToMessageId = null) => {
    if (socket && message.trim()) {
      socket.emit('sendGroupMessage', {
        groupId,
        message: message.trim(),
        messageType,
        replyToMessageId
      });
    }
  };

  const joinGroup = (groupId) => {
    if (socket) {
      socket.emit('joinGroup', { groupId });
    }
  };

  const leaveGroup = (groupId) => {
    if (socket) {
      socket.emit('leaveGroup', { groupId });
    }
  };

  const addReaction = (messageId, reactionType) => {
    if (socket) {
      socket.emit('addReaction', { messageId, reactionType });
    }
  };

  const editMessage = (messageId, newMessage) => {
    if (socket) {
      socket.emit('editMessage', { messageId, newMessage });
    }
  };

  const deleteMessage = (messageId) => {
    if (socket) {
      socket.emit('deleteMessage', { messageId });
    }
  };

  const sendTyping = (receiverId, isTyping) => {
    if (socket) {
      socket.emit('typing', { receiverId, isTyping });
    }
  };

  const markAsRead = (senderId) => {
    if (socket) {
      socket.emit('markAsRead', { senderId });
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.some(user => user.userId === userId);
  };

  const getTypingUsers = (excludeUserId) => {
    return Object.entries(typingUsers)
      .filter(([userId, data]) => data && data.isTyping && userId !== excludeUserId?.toString())
      .map(([userId, data]) => data.username);
  };

  const value = {
    socket,
    connected,
    onlineUsers,
    messages,
    setMessages,
    typingUsers,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendGroupMessage,
    joinGroup,
    leaveGroup,
    addReaction,
    editMessage,
    deleteMessage,
    sendTyping,
    markAsRead,
    isUserOnline,
    getTypingUsers
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};