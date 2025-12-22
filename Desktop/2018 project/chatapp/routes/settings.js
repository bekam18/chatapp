const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [settings] = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [req.user.id]
    );

    if (settings.length === 0) {
      // Create default settings
      await pool.query(
        'INSERT INTO user_settings (user_id) VALUES (?)',
        [req.user.id]
      );

      const [newSettings] = await pool.query(
        'SELECT * FROM user_settings WHERE user_id = ?',
        [req.user.id]
      );

      return res.json({
        success: true,
        data: { settings: newSettings[0] }
      });
    }

    res.json({
      success: true,
      data: { settings: settings[0] }
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user settings
router.put('/', authenticateToken, async (req, res) => {
  try {
    const {
      theme,
      notifications_enabled,
      sound_enabled,
      online_status_visible,
      read_receipts_enabled,
      language,
      font_size
    } = req.body;

    const updates = {};
    if (theme !== undefined) updates.theme = theme;
    if (notifications_enabled !== undefined) updates.notifications_enabled = notifications_enabled;
    if (sound_enabled !== undefined) updates.sound_enabled = sound_enabled;
    if (online_status_visible !== undefined) updates.online_status_visible = online_status_visible;
    if (read_receipts_enabled !== undefined) updates.read_receipts_enabled = read_receipts_enabled;
    if (language !== undefined) updates.language = language;
    if (font_size !== undefined) updates.font_size = font_size;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No settings to update'
      });
    }

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), req.user.id];

    await pool.query(
      `UPDATE user_settings SET ${setClause} WHERE user_id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Block user
router.post('/block', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId || userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Check if user exists
    const [userCheck] = await pool.query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (userCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Block user
    await pool.query(
      'INSERT IGNORE INTO blocked_users (blocker_id, blocked_id) VALUES (?, ?)',
      [req.user.id, userId]
    );

    res.json({
      success: true,
      message: 'User blocked successfully'
    });

  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Unblock user
router.delete('/block/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    await pool.query(
      'DELETE FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?',
      [req.user.id, userId]
    );

    res.json({
      success: true,
      message: 'User unblocked successfully'
    });

  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get blocked users
router.get('/blocked', authenticateToken, async (req, res) => {
  try {
    const [blockedUsers] = await pool.query(
      `SELECT u.id, u.username, bu.blocked_at
       FROM blocked_users bu
       JOIN users u ON bu.blocked_id = u.id
       WHERE bu.blocker_id = ?
       ORDER BY bu.blocked_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: { blockedUsers }
    });

  } catch (error) {
    console.error('Get blocked users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Star/Unstar message
router.post('/star/:messageId', authenticateToken, async (req, res) => {
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

    // Check if already starred
    const [existingStar] = await pool.query(
      'SELECT id FROM starred_messages WHERE user_id = ? AND message_id = ?',
      [req.user.id, messageId]
    );

    if (existingStar.length > 0) {
      // Unstar
      await pool.query(
        'DELETE FROM starred_messages WHERE user_id = ? AND message_id = ?',
        [req.user.id, messageId]
      );

      return res.json({
        success: true,
        message: 'Message unstarred',
        action: 'unstarred'
      });
    } else {
      // Star
      await pool.query(
        'INSERT INTO starred_messages (user_id, message_id) VALUES (?, ?)',
        [req.user.id, messageId]
      );

      return res.json({
        success: true,
        message: 'Message starred',
        action: 'starred'
      });
    }

  } catch (error) {
    console.error('Star message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get starred messages
router.get('/starred', authenticateToken, async (req, res) => {
  try {
    const [starredMessages] = await pool.query(
      `SELECT m.*, u.username as sender_username, sm.starred_at,
              CASE 
                WHEN m.group_id IS NOT NULL THEN g.name
                ELSE (SELECT username FROM users WHERE id = CASE 
                  WHEN m.sender_id = ? THEN m.receiver_id 
                  ELSE m.sender_id 
                END)
              END as chat_name
       FROM starred_messages sm
       JOIN messages m ON sm.message_id = m.id
       JOIN users u ON m.sender_id = u.id
       LEFT JOIN groups_chat g ON m.group_id = g.id
       WHERE sm.user_id = ?
       ORDER BY sm.starred_at DESC`,
      [req.user.id, req.user.id]
    );

    res.json({
      success: true,
      data: { starredMessages }
    });

  } catch (error) {
    console.error('Get starred messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;