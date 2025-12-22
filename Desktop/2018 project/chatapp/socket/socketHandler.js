const { pool } = require('../config/database');
const { authenticateSocket } = require('../middleware/auth');

// Store active users and their socket connections
const activeUsers = new Map();
const userTyping = new Map();

const handleSocketConnection = (io) => {
  // Authentication middleware for socket connections
  io.use(authenticateSocket);

  io.on('connection', async (socket) => {
    console.log(`✅ User ${socket.username} connected with socket ID: ${socket.id}`);

    try {
      // Update user status to online
      await pool.query(
        'UPDATE users SET status = "online", last_seen = CURRENT_TIMESTAMP WHERE id = ?',
        [socket.userId]
      );

      // Store user connection
      activeUsers.set(socket.userId, {
        socketId: socket.id,
        username: socket.username,
        userId: socket.userId
      });

      // Join user to their personal room
      socket.join(`user_${socket.userId}`);

      // Broadcast user online status to all connected clients
      socket.broadcast.emit('userStatusUpdate', {
        userId: socket.userId,
        username: socket.username,
        status: 'online'
      });

      // Send list of online users to the newly connected user
      const onlineUsers = Array.from(activeUsers.values()).map(user => ({
        userId: user.userId,
        username: user.username,
        status: 'online'
      }));

      socket.emit('onlineUsers', onlineUsers);

      // Handle joining a group conversation
      socket.on('joinGroup', ({ groupId }) => {
        socket.join(`group_${groupId}`);
        console.log(`User ${socket.username} joined group ${groupId}`);
      });

      // Handle leaving a group conversation
      socket.on('leaveGroup', ({ groupId }) => {
        socket.leave(`group_${groupId}`);
        console.log(`User ${socket.username} left group ${groupId}`);
      });

      // Handle group message sending
      socket.on('sendGroupMessage', async (data) => {
        try {
          const { groupId, message, messageType = 'text', replyToMessageId } = data;

          if (!groupId || !message || message.trim() === '') {
            socket.emit('messageError', { error: 'Invalid message data' });
            return;
          }

          // Verify user is a group member
          const [membership] = await pool.query(
            'SELECT role FROM group_members WHERE group_id = ? AND user_id = ?',
            [groupId, socket.userId]
          );

          if (membership.length === 0) {
            socket.emit('messageError', { error: 'Access denied' });
            return;
          }

          // Insert message into database
          const [result] = await pool.query(
            'INSERT INTO messages (sender_id, group_id, message, message_type, reply_to_message_id) VALUES (?, ?, ?, ?, ?)',
            [socket.userId, groupId, message.trim(), messageType, replyToMessageId || null]
          );

          // Get the complete message data
          const [newMessage] = await pool.query(
            `SELECT m.*, u.username as sender_username,
                    rm.message as reply_message, ru.username as reply_username
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             LEFT JOIN messages rm ON m.reply_to_message_id = rm.id
             LEFT JOIN users ru ON rm.sender_id = ru.id
             WHERE m.id = ?`,
            [result.insertId]
          );

          const messageData = newMessage[0];

          // Send message to all group members
          io.to(`group_${groupId}`).emit('receiveGroupMessage', messageData);

          console.log(`Group message sent from ${socket.username} to group ${groupId}`);

        } catch (error) {
          console.error('Send group message error:', error);
          socket.emit('messageError', { error: 'Failed to send group message' });
        }
      });

      // Handle message reactions
      socket.on('addReaction', async (data) => {
        try {
          const { messageId, reactionType } = data;

          if (!messageId || !reactionType) {
            socket.emit('reactionError', { error: 'Invalid reaction data' });
            return;
          }

          // Verify user can access this message
          const [messageCheck] = await pool.query(
            `SELECT m.id, m.group_id, m.sender_id, m.receiver_id FROM messages m
             LEFT JOIN group_members gm ON m.group_id = gm.group_id
             WHERE m.id = ? AND (
               m.sender_id = ? OR m.receiver_id = ? OR 
               (m.group_id IS NOT NULL AND gm.user_id = ?)
             )`,
            [messageId, socket.userId, socket.userId, socket.userId]
          );

          if (messageCheck.length === 0) {
            socket.emit('reactionError', { error: 'Access denied' });
            return;
          }

          const message = messageCheck[0];

          // Remove existing reaction from this user
          await pool.query(
            'DELETE FROM message_reactions WHERE message_id = ? AND user_id = ?',
            [messageId, socket.userId]
          );

          // Add new reaction
          await pool.query(
            'INSERT INTO message_reactions (message_id, user_id, reaction_type) VALUES (?, ?, ?)',
            [messageId, socket.userId, reactionType]
          );

          // Get updated reactions
          const [reactions] = await pool.query(
            `SELECT mr.reaction_type, COUNT(*) as count,
                    GROUP_CONCAT(u.username) as users
             FROM message_reactions mr
             JOIN users u ON mr.user_id = u.id
             WHERE mr.message_id = ?
             GROUP BY mr.reaction_type`,
            [messageId]
          );

          const reactionData = {
            messageId,
            reactions,
            addedBy: socket.username
          };

          // Emit to appropriate room
          if (message.group_id) {
            io.to(`group_${message.group_id}`).emit('reactionUpdate', reactionData);
          } else {
            const roomName = [message.sender_id, message.receiver_id].sort().join('_');
            io.to(roomName).emit('reactionUpdate', reactionData);
          }

        } catch (error) {
          console.error('Add reaction error:', error);
          socket.emit('reactionError', { error: 'Failed to add reaction' });
        }
      });

      // Handle message editing
      socket.on('editMessage', async (data) => {
        try {
          const { messageId, newMessage } = data;

          if (!messageId || !newMessage || newMessage.trim() === '') {
            socket.emit('messageError', { error: 'Invalid message data' });
            return;
          }

          // Check if user owns the message
          const [messageCheck] = await pool.query(
            'SELECT sender_id, group_id, receiver_id, created_at FROM messages WHERE id = ? AND sender_id = ?',
            [messageId, socket.userId]
          );

          if (messageCheck.length === 0) {
            socket.emit('messageError', { error: 'Access denied' });
            return;
          }

          const message = messageCheck[0];

          // Check if message is not too old (24 hours)
          const messageAge = Date.now() - new Date(message.created_at).getTime();
          if (messageAge > 24 * 60 * 60 * 1000) {
            socket.emit('messageError', { error: 'Message too old to edit' });
            return;
          }

          // Update message
          await pool.query(
            'UPDATE messages SET message = ?, is_edited = TRUE, edited_at = CURRENT_TIMESTAMP WHERE id = ?',
            [newMessage.trim(), messageId]
          );

          const editData = {
            messageId,
            newMessage: newMessage.trim(),
            editedBy: socket.username,
            editedAt: new Date()
          };

          // Emit to appropriate room
          if (message.group_id) {
            io.to(`group_${message.group_id}`).emit('messageEdited', editData);
          } else {
            const roomName = [message.sender_id, message.receiver_id].sort().join('_');
            io.to(roomName).emit('messageEdited', editData);
          }

        } catch (error) {
          console.error('Edit message error:', error);
          socket.emit('messageError', { error: 'Failed to edit message' });
        }
      });

      // Handle sending messages
      socket.on('sendMessage', async (data) => {
        try {
          const { receiverId, message, messageType = 'text' } = data;

          if (!receiverId || !message || message.trim() === '') {
            socket.emit('messageError', { error: 'Invalid message data' });
            return;
          }

          // Verify receiver exists
          const [receivers] = await pool.query(
            'SELECT id, username FROM users WHERE id = ?',
            [receiverId]
          );

          if (receivers.length === 0) {
            socket.emit('messageError', { error: 'Receiver not found' });
            return;
          }

          // Insert message into database
          const [result] = await pool.query(
            'INSERT INTO messages (sender_id, receiver_id, message, message_type) VALUES (?, ?, ?, ?)',
            [socket.userId, receiverId, message.trim(), messageType]
          );

          // Get the complete message data
          const [newMessage] = await pool.query(
            `SELECT m.*, 
                    sender.username as sender_username,
                    receiver.username as receiver_username
             FROM messages m
             JOIN users sender ON m.sender_id = sender.id
             JOIN users receiver ON m.receiver_id = receiver.id
             WHERE m.id = ?`,
            [result.insertId]
          );

          const messageData = newMessage[0];

          // Send message to both sender and receiver
          const roomName = [socket.userId, receiverId].sort().join('_');
          io.to(roomName).emit('receiveMessage', messageData);

          // Send to receiver's personal room if they're not in the conversation room
          io.to(`user_${receiverId}`).emit('newMessage', {
            ...messageData,
            conversationId: roomName
          });

          console.log(`Message sent from ${socket.username} to user ${receiverId}`);

        } catch (error) {
          console.error('Send message error:', error);
          socket.emit('messageError', { error: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing', ({ receiverId, isTyping }) => {
        const roomName = [socket.userId, receiverId].sort().join('_');
        
        if (isTyping) {
          userTyping.set(`${socket.userId}_${receiverId}`, true);
          socket.to(roomName).emit('userTyping', {
            userId: socket.userId,
            username: socket.username,
            isTyping: true
          });
        } else {
          userTyping.delete(`${socket.userId}_${receiverId}`);
          socket.to(roomName).emit('userTyping', {
            userId: socket.userId,
            username: socket.username,
            isTyping: false
          });
        }
      });

      // Handle message read status
      socket.on('markAsRead', async ({ senderId }) => {
        try {
          await pool.query(
            'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
            [senderId, socket.userId]
          );

          // Notify sender that messages were read
          const senderUser = activeUsers.get(senderId);
          if (senderUser) {
            io.to(`user_${senderId}`).emit('messagesRead', {
              readBy: socket.userId,
              readByUsername: socket.username
            });
          }

        } catch (error) {
          console.error('Mark as read error:', error);
        }
      });

      // Handle disconnect
      socket.on('disconnect', async () => {
        console.log(`❌ User ${socket.username} disconnected`);

        try {
          // Update user status to offline
          await pool.query(
            'UPDATE users SET status = "offline", last_seen = CURRENT_TIMESTAMP WHERE id = ?',
            [socket.userId]
          );

          // Remove from active users
          activeUsers.delete(socket.userId);

          // Clear typing indicators
          for (const [key] of userTyping) {
            if (key.startsWith(`${socket.userId}_`)) {
              userTyping.delete(key);
            }
          }

          // Broadcast user offline status
          socket.broadcast.emit('userStatusUpdate', {
            userId: socket.userId,
            username: socket.username,
            status: 'offline'
          });

        } catch (error) {
          console.error('Disconnect error:', error);
        }
      });

      // Handle connection errors
      socket.on('error', (error) => {
        console.error(`Socket error for user ${socket.username}:`, error);
      });

    } catch (error) {
      console.error('Socket connection error:', error);
      socket.disconnect();
    }
  });

  // Handle connection errors
  io.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error);
  });
};

// Get active users (for API endpoints)
const getActiveUsers = () => {
  return Array.from(activeUsers.values());
};

// Check if user is online
const isUserOnline = (userId) => {
  return activeUsers.has(userId);
};

module.exports = {
  handleSocketConnection,
  getActiveUsers,
  isUserOnline
};