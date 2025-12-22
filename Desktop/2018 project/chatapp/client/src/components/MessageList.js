import { useEffect, useRef } from 'react';
import MessageReactions from './MessageReactions';
import MessageActions from './MessageActions';
import MediaMessage from './MediaMessage';
import './MessageList.css';

const MessageList = ({ messages, currentUser, selectedUser, typingUsers }) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      // Show time for messages from today
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      // Show day and time for messages from this week
      return date.toLocaleDateString([], { 
        weekday: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      // Show full date for older messages
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.created_at).toDateString();
    const previousDate = new Date(previousMessage.created_at).toDateString();
    
    return currentDate !== previousDate;
  };

  const formatDateSeparator = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const groupConsecutiveMessages = (messages) => {
    const grouped = [];
    let currentGroup = null;

    messages.forEach((message, index) => {
      const isFromCurrentUser = message.sender_id === currentUser.id;
      const previousMessage = messages[index - 1];
      
      const shouldStartNewGroup = !previousMessage || 
        previousMessage.sender_id !== message.sender_id ||
        (new Date(message.created_at) - new Date(previousMessage.created_at)) > 5 * 60 * 1000; // 5 minutes

      if (shouldStartNewGroup) {
        if (currentGroup) {
          grouped.push(currentGroup);
        }
        currentGroup = {
          sender_id: message.sender_id,
          sender_username: message.sender_username,
          isFromCurrentUser,
          messages: [message]
        };
      } else {
        currentGroup.messages.push(message);
      }
    });

    if (currentGroup) {
      grouped.push(currentGroup);
    }

    return grouped;
  };

  const messageGroups = groupConsecutiveMessages(messages);

  return (
    <div className="message-list" ref={messagesContainerRef}>
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <div className="no-messages-content">
              <span className="no-messages-icon">💬</span>
              <h3>No messages yet</h3>
              <p>Start the conversation with {selectedUser?.username}</p>
            </div>
          </div>
        ) : (
          <>
            {messageGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Date separator */}
                {shouldShowDateSeparator(
                  group.messages[0], 
                  groupIndex > 0 ? messageGroups[groupIndex - 1].messages.slice(-1)[0] : null
                ) && (
                  <div className="date-separator">
                    <span className="date-text">
                      {formatDateSeparator(group.messages[0].created_at)}
                    </span>
                  </div>
                )}

                {/* Message group */}
                <div className={`message-group ${group.isFromCurrentUser ? 'own' : 'other'}`}>
                  {!group.isFromCurrentUser && (
                    <div className="sender-info">
                      <div className="sender-avatar">
                        {group.sender_username.charAt(0).toUpperCase()}
                      </div>
                      <span className="sender-name">{group.sender_username}</span>
                    </div>
                  )}
                  
                  <div className="messages-in-group">
                    {group.messages.map((message, messageIndex) => (
                      <div
                        key={message.id}
                        className={`message-item ${group.isFromCurrentUser ? 'own' : 'other'}`}
                      >
                        <div className="message-content">
                          {/* Reply indicator */}
                          {message.reply_to_message_id && (
                            <div className="reply-indicator">
                              <span className="reply-icon">↩️</span>
                              <span className="reply-text">
                                Replying to {message.reply_username || 'message'}
                              </span>
                            </div>
                          )}

                          <div className="message-text">
                            {/* Media content */}
                            {message.media_url && (
                              <MediaMessage
                                mediaUrl={message.media_url}
                                mediaType={message.media_type}
                                fileName={message.file_name}
                                fileSize={message.file_size}
                                originalName={message.file_name}
                              />
                            )}
                            
                            {/* Text content */}
                            {message.message && (
                              <div className="text-content">
                                {message.message}
                              </div>
                            )}
                            
                            {message.is_edited && (
                              <span className="edited-indicator" title={`Edited ${formatMessageTime(message.edited_at)}`}>
                                (edited)
                              </span>
                            )}
                          </div>

                          <div className="message-meta">
                            <span className="message-time">
                              {formatMessageTime(message.created_at)}
                            </span>
                            {group.isFromCurrentUser && (
                              <span className={`message-status ${message.is_read ? 'read' : 'sent'}`}>
                                {message.is_read ? '✓✓' : '✓'}
                              </span>
                            )}
                            
                            {/* Message Actions */}
                            <MessageActions
                              message={message}
                              currentUser={currentUser}
                            />
                          </div>

                          {/* Message Reactions */}
                          <MessageReactions
                            message={message}
                            currentUser={currentUser}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="typing-indicator">
                <div className="typing-avatar">
                  {selectedUser?.username.charAt(0).toUpperCase()}
                </div>
                <div className="typing-content">
                  <div className="typing-text">
                    {typingUsers.length === 1 
                      ? `${typingUsers[0]} is typing...`
                      : `${typingUsers.join(', ')} are typing...`
                    }
                  </div>
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;