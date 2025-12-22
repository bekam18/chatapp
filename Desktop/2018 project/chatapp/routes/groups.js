const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create a new group
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, memberIds = [] } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Group name is required'
      });
    }

    // Create the group
    const [result] = await pool.query(
      'INSERT INTO groups_chat (name, description, created_by) VALUES (?, ?, ?)',
      [name.trim(), description || '', req.user.id]
    );

    const groupId = result.insertId;

    // Add creator as admin
    await pool.query(
      'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
      [groupId, req.user.id, 'admin']
    );

    // Add other members
    if (memberIds.length > 0) {
      const memberValues = memberIds.map(userId => [groupId, userId, 'member']);
      await pool.query(
        'INSERT INTO group_members (group_id, user_id, role) VALUES ?',
        [memberValues]
      );
    }

    // Get the created group with members
    const [groups] = await pool.query(
      `SELECT g.*, u.username as created_by_username,
              COUNT(gm.user_id) as member_count
       FROM groups_chat g
       JOIN users u ON g.created_by = u.id
       LEFT JOIN group_members gm ON g.id = gm.group_id
       WHERE g.id = ?
       GROUP BY g.id`,
      [groupId]
    );

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: { group: groups[0] }
    });

  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's groups
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [groups] = await pool.query(
      `SELECT g.*, u.username as created_by_username,
              COUNT(gm.user_id) as member_count,
              gm2.role as user_role
       FROM groups_chat g
       JOIN users u ON g.created_by = u.id
       JOIN group_members gm2 ON g.id = gm2.group_id AND gm2.user_id = ?
       LEFT JOIN group_members gm ON g.id = gm.group_id
       GROUP BY g.id
       ORDER BY g.updated_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: { groups }
    });

  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get group details with members
router.get('/:groupId', authenticateToken, async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);

    // Check if user is a member
    const [membership] = await pool.query(
      'SELECT role FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, req.user.id]
    );

    if (membership.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get group details
    const [groups] = await pool.query(
      `SELECT g.*, u.username as created_by_username
       FROM groups_chat g
       JOIN users u ON g.created_by = u.id
       WHERE g.id = ?`,
      [groupId]
    );

    // Get group members
    const [members] = await pool.query(
      `SELECT gm.role, gm.joined_at, u.id, u.username, u.status
       FROM group_members gm
       JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = ?
       ORDER BY gm.role DESC, gm.joined_at ASC`,
      [groupId]
    );

    res.json({
      success: true,
      data: {
        group: groups[0],
        members,
        userRole: membership[0].role
      }
    });

  } catch (error) {
    console.error('Get group details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add member to group
router.post('/:groupId/members', authenticateToken, async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const { userId } = req.body;

    // Check if user is admin
    const [membership] = await pool.query(
      'SELECT role FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, req.user.id]
    );

    if (membership.length === 0 || membership[0].role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can add members'
      });
    }

    // Add member
    await pool.query(
      'INSERT IGNORE INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
      [groupId, userId, 'member']
    );

    res.json({
      success: true,
      message: 'Member added successfully'
    });

  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Remove member from group
router.delete('/:groupId/members/:userId', authenticateToken, async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const userId = parseInt(req.params.userId);

    // Check if user is admin or removing themselves
    const [membership] = await pool.query(
      'SELECT role FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, req.user.id]
    );

    if (membership.length === 0 || 
        (membership[0].role !== 'admin' && req.user.id !== userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Remove member
    await pool.query(
      'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );

    res.json({
      success: true,
      message: 'Member removed successfully'
    });

  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Send group message
router.post('/:groupId/messages', authenticateToken, async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const { message, messageType = 'text', replyToMessageId } = req.body;

    // Validate input
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Check if user is a member
    const [membership] = await pool.query(
      'SELECT role FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, req.user.id]
    );

    if (membership.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Insert message
    const [result] = await pool.query(
      `INSERT INTO messages (sender_id, group_id, message, message_type, reply_to_message_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, groupId, message.trim(), messageType, replyToMessageId || null]
    );

    // Get the created message with details
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

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message: newMessage[0] }
    });

  } catch (error) {
    console.error('Send group message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get group messages
router.get('/:groupId/messages', authenticateToken, async (req, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Check if user is a member
    const [membership] = await pool.query(
      'SELECT role FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, req.user.id]
    );

    if (membership.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get messages
    const [messages] = await pool.query(
      `SELECT m.*, u.username as sender_username,
              rm.message as reply_message, ru.username as reply_username
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       LEFT JOIN messages rm ON m.reply_to_message_id = rm.id
       LEFT JOIN users ru ON rm.sender_id = ru.id
       WHERE m.group_id = ? AND m.is_deleted = FALSE
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [groupId, Number(limit), Number(offset)]
    );

    res.json({
      success: true,
      data: { messages: messages.reverse() }
    });

  } catch (error) {
    console.error('Get group messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;