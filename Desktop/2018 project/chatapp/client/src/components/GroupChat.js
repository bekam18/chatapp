import React, { useState, useEffect } from 'react';
import { groupsAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import './GroupChat.css';

const GroupChat = ({ onGroupSelect, selectedGroup }) => {
  const [groups, setGroups] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useAuth();
  const { joinGroup, leaveGroup } = useSocket();

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      joinGroup(selectedGroup.id);
    }

    return () => {
      if (selectedGroup) {
        leaveGroup(selectedGroup.id);
      }
    };
  }, [selectedGroup, joinGroup, leaveGroup]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await groupsAPI.getGroups();
      setGroups(response.data.data.groups);
    } catch (error) {
      console.error('Failed to load groups:', error);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (formData) => {
    try {
      const response = await groupsAPI.createGroup(
        formData.name,
        formData.description,
        formData.memberIds
      );
      
      setGroups(prev => [response.data.data.group, ...prev]);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create group:', error);
      setError('Failed to create group');
    }
  };

  if (loading) {
    return <div className="group-loading">Loading groups...</div>;
  }

  return (
    <div className="group-chat">
      <div className="group-header">
        <h3>Groups</h3>
        <button 
          className="create-group-btn"
          onClick={() => setShowCreateForm(true)}
        >
          +
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="group-list">
        {groups.map(group => (
          <div
            key={group.id}
            className={`group-item ${selectedGroup?.id === group.id ? 'selected' : ''}`}
            onClick={() => onGroupSelect(group)}
          >
            <div className="group-avatar">
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div className="group-info">
              <div className="group-name">{group.name}</div>
              <div className="group-meta">
                {group.member_count} members • {group.user_role}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateForm && (
        <CreateGroupForm
          onSubmit={handleCreateGroup}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
};

const CreateGroupForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    memberIds: []
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load users for member selection
    const loadUsers = async () => {
      try {
        const { usersAPI } = await import('../services/api');
        const response = await usersAPI.getUsers();
        setUsers(response.data.data.users);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };
    loadUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (userId) => {
    setFormData(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(userId)
        ? prev.memberIds.filter(id => id !== userId)
        : [...prev.memberIds, userId]
    }));
  };

  return (
    <div className="create-group-overlay">
      <div className="create-group-form">
        <h3>Create New Group</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Group Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter group name"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter group description (optional)"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Add Members</label>
            <div className="member-list">
              {users.map(user => (
                <div key={user.id} className="member-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.memberIds.includes(user.id)}
                      onChange={() => toggleMember(user.id)}
                    />
                    {user.username}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupChat;