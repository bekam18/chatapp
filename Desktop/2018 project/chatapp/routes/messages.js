const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get conversation messages between current user and another user
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const otherUserId = parseInt(req.params.userId);
    const { page = 1, limit = 50 } = req.query;
    
    if (isNaN(otherUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const offset = (page - 1) * limit;

    // Get messages between the two users
    const [messages] = await pool.query(
      `SELECT m.*, 
              sender.username as sender_username,
              receiver.username as receiver_username
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users receiver ON m.receiver_id = receiver.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) 
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, otherUserId, otherUserId, req.user.id, Number(limit), Number(offset)]
    );

    // Get total count for pagination
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total
       FROM messages
       WHERE (sender_id = ? AND receiver_id = ?) 
          OR (sender_id = ? AND receiver_id = ?)`,
      [req.user.id, otherUserId, otherUserId, req.user.id]
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Mark messages as read (messages sent to current user)
    await pool.query(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
      [otherUserId, req.user.id]
    );

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalMessages: total,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Send a new message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { receiverId, message, messageType = 'text' } = req.body;
    
    if (!receiverId || !message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and message are required'
      });
    }

    // Verify receiver exists
    const [receivers] = await pool.query(
      'SELECT id, username FROM users WHERE id = ?',
      [receiverId]
    );

    if (receivers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Insert message
    const [result] = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, message, message_type) VALUES (?, ?, ?, ?)',
      [req.user.id, receiverId, message.trim(), messageType]
    );

    // Get the created message with user details
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

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: newMessage[0]
      }
    });

  } catch (error) {
    console.error('Message send error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get conversations list for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [conversations] = await pool.query(
      `SELECT DISTINCT
         CASE 
           WHEN m.sender_id = ? THEN m.receiver_id 
           ELSE m.sender_id 
         END as other_user_id,
         u.username as other_username,
         u.status as other_user_status,
         u.last_seen as other_user_last_seen,
         m.message as last_message,
         m.created_at as last_message_time,
         m.sender_id as last_message_sender_id,
         (SELECT COUNT(*) FROM messages 
          WHERE sender_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END 
            AND receiver_id = ? 
            AND is_read = FALSE) as unread_count
       FROM messages m
       JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
       WHERE m.sender_id = ? OR m.receiver_id = ?
       AND m.id IN (
         SELECT MAX(id) FROM messages 
         WHERE (sender_id = ? AND receiver_id = u.id) 
            OR (sender_id = u.id AND receiver_id = ?)
         GROUP BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id)
       )
       ORDER BY m.created_at DESC`,
      [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]
    );

    res.json({
      success: true,
      data: {
        conversations
      }
    });

  } catch (error) {
    console.error('Conversations fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Mark messages as read
router.put('/:userId/read', authenticateToken, async (req, res) => {
  try {
    const otherUserId = parseInt(req.params.userId);
    
    if (isNaN(otherUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    await pool.query(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
      [otherUserId, req.user.id]
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Edit message
router.put('/:messageId', authenticateToken, async (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId);
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Check if user owns the message
    const [messageCheck] = await pool.query(
      'SELECT sender_id, created_at FROM messages WHERE id = ? AND sender_id = ?',
      [messageId, req.user.id]
    );

    if (messageCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied or message not found'
      });
    }

    // Check if message is not too old (24 hours limit)
    const messageAge = Date.now() - new Date(messageCheck[0].created_at).getTime();
    const maxEditTime = 24 * 60 * 60 * 1000; // 24 hours

    if (messageAge > maxEditTime) {
      return res.status(400).json({
        success: false,
        message: 'Message is too old to edit (24 hour limit)'
      });
    }

    // Update message
    await pool.query(
      'UPDATE messages SET message = ?, is_edited = TRUE, edited_at = CURRENT_TIMESTAMP WHERE id = ?',
      [message.trim(), messageId]
    );

    res.json({
      success: true,
      message: 'Message updated successfully'
    });

  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete message
router.delete('/:messageId', authenticateToken, async (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId);
    const { deleteForEveryone = false } = req.body;

    // Check if user owns the message or is group admin
    const [messageCheck] = await pool.query(
      `SELECT m.sender_id, m.group_id, gm.role
       FROM messages m
       LEFT JOIN group_members gm ON m.group_id = gm.group_id AND gm.user_id = ?
       WHERE m.id = ?`,
      [req.user.id, messageId]
    );

    if (messageCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const message = messageCheck[0];
    const isOwner = message.sender_id === req.user.id;
    const isGroupAdmin = message.group_id && message.role === 'admin';

    if (!isOwner && !isGroupAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (deleteForEveryone && (isOwner || isGroupAdmin)) {
      // Delete for everyone
      await pool.query(
        'UPDATE messages SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP, message = "[This message was deleted]" WHERE id = ?',
        [messageId]
      );
    } else {
      // Delete only for current user (not implemented in this basic version)
      await pool.query(
        'UPDATE messages SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP, message = "[This message was deleted]" WHERE id = ?',
        [messageId]
      );
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;