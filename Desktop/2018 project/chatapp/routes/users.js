const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all users except current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, username, email, status, last_seen 
       FROM users 
       WHERE id != ? 
       ORDER BY status DESC, username ASC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        users
      }
    });

  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Search users by username
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const searchTerm = `%${q.trim()}%`;
    const [users] = await pool.query(
      `SELECT id, username, email, status, last_seen 
       FROM users 
       WHERE id != ? AND username LIKE ?
       ORDER BY status DESC, username ASC
       LIMIT 20`,
      [req.user.id, searchTerm]
    );

    res.json({
      success: true,
      data: {
        users,
        query: q.trim()
      }
    });

  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    const [users] = await pool.query(
      'SELECT id, username, email, status, last_seen, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: users[0]
      }
    });

  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;