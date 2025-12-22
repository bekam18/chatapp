import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import './UserList.css';

const UserList = ({ 
  users, 
  selectedUser, 
  onUserSelect, 
  onSearch, 
  searchQuery,
  conversations 
}) => {
  const [searchInput, setSearchInput] = useState(searchQuery);
  const { isUserOnline } = useSocket();

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      onSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return '';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return lastSeenDate.toLocaleDateString();
  };

  const getConversationInfo = (userId) => {
    const conversation = conversations.find(conv => conv.other_user_id === userId);
    return conversation || null;
  };

  const sortedUsers = [...users].sort((a, b) => {
    // First, sort by online status
    const aOnline = isUserOnline(a.id);
    const bOnline = isUserOnline(b.id);
    
    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;
    
    // Then by conversation activity (users with recent messages first)
    const aConv = getConversationInfo(a.id);
    const bConv = getConversationInfo(b.id);
    
    if (aConv && !bConv) return -1;
    if (!aConv && bConv) return 1;
    
    if (aConv && bConv) {
      const aTime = new Date(aConv.last_message_time);
      const bTime = new Date(bConv.last_message_time);
      return bTime - aTime;
    }
    
    // Finally, sort alphabetically
    return a.username.localeCompare(b.username);
  });

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>Chats</h3>
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search users..."
              value={searchInput}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button type="submit" className="search-button">
              🔍
            </button>
          </div>
        </form>
      </div>

      <div className="users-container">
        {sortedUsers.length === 0 ? (
          <div className="no-users">
            {searchQuery ? 'No users found' : 'No users available'}
          </div>
        ) : (
          sortedUsers.map(user => {
            const isOnline = isUserOnline(user.id);
            const isSelected = selectedUser?.id === user.id;
            const conversation = getConversationInfo(user.id);
            
            return (
              <div
                key={user.id}
                className={`user-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onUserSelect(user)}
              >
                <div className="user-avatar">
                  <div className="avatar-circle">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`} />
                </div>

                <div className="user-info">
                  <div className="user-header">
                    <span className="username">{user.username}</span>
                    {conversation && conversation.unread_count > 0 && (
                      <span className="unread-badge">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                  
                  <div className="user-details">
                    {conversation ? (
                      <div className="last-message">
                        <span className="message-preview">
                          {conversation.last_message_sender_id === user.id ? '' : 'You: '}
                          {conversation.last_message.length > 30 
                            ? `${conversation.last_message.substring(0, 30)}...`
                            : conversation.last_message
                          }
                        </span>
                        <span className="message-time">
                          {formatLastSeen(conversation.last_message_time)}
                        </span>
                      </div>
                    ) : (
                      <div className="user-status-text">
                        {isOnline ? (
                          <span className="status-online">Online</span>
                        ) : (
                          <span className="status-offline">
                            {formatLastSeen(user.last_seen) || 'Offline'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserList;