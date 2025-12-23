// Demo data for when backend is not available
export const demoUsers = [
  { id: 1, username: 'Alice Johnson', email: 'alice@example.com', isOnline: true },
  { id: 2, username: 'Bob Smith', email: 'bob@example.com', isOnline: false },
  { id: 3, username: 'Carol Davis', email: 'carol@example.com', isOnline: true },
  { id: 4, username: 'David Wilson', email: 'david@example.com', isOnline: true }
];

export const demoMessages = [
  {
    id: 1,
    senderId: 1,
    receiverId: 2,
    message: 'Hey! How are you doing?',
    messageType: 'text',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isRead: true
  },
  {
    id: 2,
    senderId: 2,
    receiverId: 1,
    message: 'I\'m doing great! Thanks for asking. How about you?',
    messageType: 'text',
    createdAt: new Date(Date.now() - 3000000).toISOString(),
    isRead: true
  },
  {
    id: 3,
    senderId: 1,
    receiverId: 2,
    message: 'Just working on my final year project. It\'s a real-time chat app!',
    messageType: 'text',
    createdAt: new Date(Date.now() - 2400000).toISOString(),
    isRead: true
  },
  {
    id: 4,
    senderId: 2,
    receiverId: 1,
    message: 'That sounds amazing! What technologies are you using?',
    messageType: 'text',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    isRead: true
  },
  {
    id: 5,
    senderId: 1,
    receiverId: 2,
    message: 'React, Node.js, Socket.IO, and MySQL. It has group chat, reactions, media sharing, and more!',
    messageType: 'text',
    createdAt: new Date(Date.now() - 1200000).toISOString(),
    isRead: false
  }
];

export const demoGroups = [
  {
    id: 1,
    name: 'Final Year Project Team',
    description: 'Discussion about our chat application project',
    memberCount: 4,
    lastMessage: 'Great progress on the frontend!',
    lastMessageTime: new Date(Date.now() - 600000).toISOString()
  },
  {
    id: 2,
    name: 'Study Group',
    description: 'Computer Science study discussions',
    memberCount: 6,
    lastMessage: 'Meeting tomorrow at 3 PM',
    lastMessageTime: new Date(Date.now() - 1800000).toISOString()
  }
];

export const demoCurrentUser = {
  id: 1,
  username: 'Demo User',
  email: 'demo@example.com'
};

// Demo API responses
export const createDemoAPI = () => ({
  authAPI: {
    login: () => Promise.resolve({ 
      data: { 
        token: 'demo-token', 
        user: demoCurrentUser 
      } 
    }),
    register: () => Promise.resolve({ 
      data: { 
        token: 'demo-token', 
        user: demoCurrentUser 
      } 
    }),
    logout: () => Promise.resolve({ data: { message: 'Logged out' } }),
    getProfile: () => Promise.resolve({ data: demoCurrentUser })
  },
  
  usersAPI: {
    getUsers: () => Promise.resolve({ data: demoUsers }),
    searchUsers: (query) => Promise.resolve({ 
      data: demoUsers.filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase())
      ) 
    }),
    getUserById: (id) => Promise.resolve({ 
      data: demoUsers.find(user => user.id === parseInt(id)) 
    })
  },
  
  messagesAPI: {
    getMessages: (userId) => Promise.resolve({ 
      data: demoMessages.filter(msg => 
        (msg.senderId === parseInt(userId) && msg.receiverId === demoCurrentUser.id) ||
        (msg.receiverId === parseInt(userId) && msg.senderId === demoCurrentUser.id)
      ) 
    }),
    sendMessage: (receiverId, message) => {
      const newMessage = {
        id: Date.now(),
        senderId: demoCurrentUser.id,
        receiverId: parseInt(receiverId),
        message,
        messageType: 'text',
        createdAt: new Date().toISOString(),
        isRead: false
      };
      return Promise.resolve({ data: newMessage });
    },
    getConversations: () => Promise.resolve({ data: demoUsers }),
    markAsRead: () => Promise.resolve({ data: { success: true } }),
    editMessage: () => Promise.resolve({ data: { success: true } }),
    deleteMessage: () => Promise.resolve({ data: { success: true } })
  },
  
  groupsAPI: {
    getGroups: () => Promise.resolve({ data: demoGroups }),
    createGroup: (name, description) => Promise.resolve({ 
      data: { 
        id: Date.now(), 
        name, 
        description, 
        memberCount: 1 
      } 
    }),
    getGroupDetails: (id) => Promise.resolve({ 
      data: demoGroups.find(group => group.id === parseInt(id)) 
    }),
    addMember: () => Promise.resolve({ data: { success: true } }),
    removeMember: () => Promise.resolve({ data: { success: true } }),
    getGroupMessages: () => Promise.resolve({ data: demoMessages.slice(0, 3) }),
    sendGroupMessage: (groupId, message) => Promise.resolve({ 
      data: {
        id: Date.now(),
        senderId: demoCurrentUser.id,
        groupId: parseInt(groupId),
        message,
        messageType: 'text',
        createdAt: new Date().toISOString()
      }
    })
  }
});