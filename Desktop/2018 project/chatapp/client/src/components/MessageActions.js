import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { messagesAPI, settingsAPI } from '../services/api';
import './MessageActions.css';

const MessageActions = ({ message, currentUser, onEdit, onDelete, onStar }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editText, setEditText] = useState(message.message);
  const [loading, setLoading] = useState(false);
  
  const { editMessage, deleteMessage } = useSocket();

  const isOwner = message.sender_id === currentUser.id;
  const canEdit = isOwner && !message.is_deleted;
  const canDelete = isOwner && !message.is_deleted;

  // Check if message is not too old (24 hours) for editing
  const messageAge = Date.now() - new Date(message.created_at).getTime();
  const canEditTime = messageAge < 24 * 60 * 60 * 1000;

  const handleEdit = async () => {
    if (!editText.trim() || editText === message.message || loading) return;

    setLoading(true);
    try {
      // Send via socket for real-time update
      editMessage(message.id, editText.trim());
      
      // Also send via API for persistence
      await messagesAPI.editMessage(message.id, editText.trim());
      
      setShowEditForm(false);
      setShowMenu(false);
      if (onEdit) onEdit(message.id, editText.trim());
    } catch (error) {
      console.error('Failed to edit message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    setLoading(true);
    try {
      // Send via socket for real-time update
      deleteMessage(message.id);
      
      // Also send via API for persistence
      await messagesAPI.deleteMessage(message.id);
      
      setShowMenu(false);
      if (onDelete) onDelete(message.id);
    } catch (error) {
      console.error('Failed to delete message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStar = async () => {
    setLoading(true);
    try {
      await settingsAPI.starMessage(message.id);
      setShowMenu(false);
      if (onStar) onStar(message.id);
    } catch (error) {
      console.error('Failed to star message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = () => {
    // This would trigger reply functionality in parent component
    setShowMenu(false);
    // onReply could be passed as prop to handle reply
  };

  if (showEditForm) {
    return (
      <div className="message-edit-form">
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleEdit();
            }
            if (e.key === 'Escape') {
              setShowEditForm(false);
              setEditText(message.message);
            }
          }}
          disabled={loading}
          autoFocus
        />
        <div className="edit-actions">
          <button 
            onClick={() => {
              setShowEditForm(false);
              setEditText(message.message);
            }}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            onClick={handleEdit}
            disabled={loading || !editText.trim() || editText === message.message}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="message-actions">
      <button
        className="actions-trigger"
        onClick={() => setShowMenu(!showMenu)}
        title="Message actions"
      >
        ⋯
      </button>

      {showMenu && (
        <div className="actions-menu">
          <button onClick={handleReply}>
            <span className="action-icon">↩️</span>
            Reply
          </button>
          
          <button onClick={handleStar}>
            <span className="action-icon">⭐</span>
            Star
          </button>

          {canEdit && canEditTime && (
            <button onClick={() => {
              setShowEditForm(true);
              setShowMenu(false);
            }}>
              <span className="action-icon">✏️</span>
              Edit
            </button>
          )}

          {canDelete && (
            <button onClick={handleDelete} className="delete-action">
              <span className="action-icon">🗑️</span>
              Delete
            </button>
          )}
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="actions-overlay"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default MessageActions;