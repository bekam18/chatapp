import { useState, useRef, useEffect } from 'react';
import MediaUpload from './MediaUpload';
import './MessageInput.css';

const MessageInput = ({ onSendMessage, onSendMedia, disabled, placeholder }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Focus input when component mounts
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      // sendTyping will be called with receiverId in the parent component
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        // sendTyping(receiverId, false) will be called in parent
      }
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        // sendTyping(receiverId, false) will be called in parent
      }
      
      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleMediaUpload = (files) => {
    if (onSendMedia && files.length > 0) {
      files.forEach(file => {
        onSendMedia(file);
      });
    }
    setShowMediaUpload(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-form">
        <div className="input-wrapper">
          <button
            type="button"
            className="media-button"
            onClick={() => setShowMediaUpload(true)}
            disabled={disabled}
            title="Attach media"
          >
            📎
          </button>
          
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || 'Type a message...'}
            disabled={disabled}
            className="message-textarea"
            rows={1}
            maxLength={1000}
          />
          
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className="send-button"
            title="Send message"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M2 21L23 12L2 3V10L17 12L2 14V21Z" 
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        
        {message.length > 800 && (
          <div className="character-count">
            {message.length}/1000
          </div>
        )}
      </form>

      {/* Media Upload Modal */}
      {showMediaUpload && (
        <MediaUpload
          onFileUploaded={handleMediaUpload}
          onClose={() => setShowMediaUpload(false)}
          multiple={true}
        />
      )}
    </div>
  );
};

export default MessageInput;