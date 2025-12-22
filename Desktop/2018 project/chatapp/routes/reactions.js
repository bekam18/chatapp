const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Add or update reaction to a message
router.post('/:messageId', authenticateToken, async (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId);
    const { reactionType } = req.body;

    if (!reactionType) {
      return res.status(400).json({
        success: false,
        message: 'Reaction type is required'
      });
    }

    // Verify user can access this message
    const [messageCheck] = await pool.query(
      `SELECT m.id FROM messages m
       LEFT JOIN group_members gm ON m.group_id = gm.group_id
       WHERE m.id = ? AND (
         m.sender_id = ? OR m.receiver_id = ? OR 
         (m.group_id IS NOT NULL AND gm.user_id = ?)
       )`,
      [messageId, req.user.id, req.user.id, req.user.id]
    );

    if (messageCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if user already reacted with this type
    const [existingReaction] = await pool.query(
      'SELECT id FROM message_reactions WHERE message_id = ? AND user_id = ? AND reaction_type = ?',
      [messageId, req.user.id, reactionType]
    );

    if (existingReaction.length > 0) {
      // Remove existing reaction (toggle off)
      await pool.query(
        'DELETE FROM message_reactions WHERE message_id = ? AND user_id = ? AND reaction_type = ?',
        [messageId, req.user.id, reactionType]
      );

      return res.json({
        success: true,
        message: 'Reaction removed',
        action: 'removed'
      });
    } else {
      // Remove any other reaction from this user on this message (only one reaction per user per message)
      await pool.query(
        'DELETE FROM message_reactions WHERE message_id = ? AND user_id = ?',
        [messageId, req.user.id]
      );

      // Add new reaction
      await pool.query(
        'INSERT INTO message_reactions (message_id, user_id, reaction_type) VALUES (?, ?, ?)',
        [messageId, req.user.id, reactionType]
      );

      return res.json({
        success: true,
        message: 'Reaction added',
        action: 'added'
      });
    }

  } catch (error) {
    console.error('Reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get reactions for a message
router.get('/:messageId', authenticateToken, async (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId);

    // Verify user can access this message
    const [messageCheck] = await pool.query(
      `SELECT m.id FROM messages m
       LEFT JOIN group_members gm ON m.group_id = gm.group_id
       WHERE m.id = ? AND (
         m.sender_id = ? OR m.receiver_id = ? OR 
         (m.group_id IS NOT NULL AND gm.user_id = ?)
       )`,
      [messageId, req.user.id, req.user.id, req.user.id]
    );

    if (messageCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get reactions grouped by type
    const [reactions] = await pool.query(
      `SELECT mr.reaction_type, COUNT(*) as count,
              GROUP_CONCAT(u.username) as users,
              MAX(CASE WHEN mr.user_id = ? THEN 1 ELSE 0 END) as user_reacted
       FROM message_reactions mr
       JOIN users u ON mr.user_id = u.id
       WHERE mr.message_id = ?
       GROUP BY mr.reaction_type
       ORDER BY count DESC`,
      [req.user.id, messageId]
    );

    res.json({
      success: true,
      data: { reactions }
    });

  } catch (error) {
    console.error('Get reactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Remove all reactions from a message (admin only)
router.delete('/:messageId', authenticateToken, async (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId);

    // Check if user is the message sender or group admin
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

    // Remove all reactions
    await pool.query(
      'DELETE FROM message_reactions WHERE message_id = ?',
      [messageId]
    );

    res.json({
      success: true,
      message: 'All reactions removed'
    });

  } catch (error) {
    console.error('Remove reactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;