import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { reactionsAPI } from '../services/api';
import './MessageReactions.css';

const REACTION_EMOJIS = {
  like: '👍',
  love: '❤️',
  laugh: '😂',
  wow: '😮',
  sad: '😢',
  angry: '😠'
};

const MessageReactions = ({ message, currentUser }) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addReaction } = useSocket();

  const handleReactionClick = async (reactionType) => {
    if (loading) return;

    setLoading(true);
    try {
      // Send via socket for real-time update
      addReaction(message.id, reactionType);
      
      // Also send via API for persistence
      await reactionsAPI.addReaction(message.id, reactionType);
      
      setShowReactionPicker(false);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReactionSummary = () => {
    if (!message.reactions || message.reactions.length === 0) {
      return null;
    }

    return message.reactions.map(reaction => ({
      type: reaction.reaction_type,
      count: reaction.count,
      users: reaction.users ? reaction.users.split(',') : [],
      userReacted: reaction.user_reacted === 1
    }));
  };

  const reactionSummary = getReactionSummary();

  return (
    <div className="message-reactions">
      {/* Existing Reactions */}
      {reactionSummary && reactionSummary.length > 0 && (
        <div className="reactions-display">
          {reactionSummary.map(reaction => (
            <div
              key={reaction.type}
              className={`reaction-item ${reaction.userReacted ? 'user-reacted' : ''}`}
              onClick={() => handleReactionClick(reaction.type)}
              title={`${reaction.users.join(', ')} reacted with ${reaction.type}`}
            >
              <span className="reaction-emoji">
                {REACTION_EMOJIS[reaction.type] || '👍'}
              </span>
              <span className="reaction-count">{reaction.count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add Reaction Button */}
      <div className="reaction-controls">
        <button
          className="add-reaction-btn"
          onClick={() => setShowReactionPicker(!showReactionPicker)}
          disabled={loading}
        >
          😊
        </button>

        {/* Reaction Picker */}
        {showReactionPicker && (
          <div className="reaction-picker">
            {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
              <button
                key={type}
                className="reaction-option"
                onClick={() => handleReactionClick(type)}
                disabled={loading}
                title={type}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageReactions;