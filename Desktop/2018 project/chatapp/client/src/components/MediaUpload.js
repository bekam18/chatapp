import React, { useState, useRef } from 'react';
import { uploadAPI } from '../services/api';
import './MediaUpload.css';

const MediaUpload = ({ onFileUploaded, onClose, multiple = false }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    
    // Validate files
    const validFiles = fileArray.filter(file => {
      const maxSize = 50 * 1024 * 1024; // 50MB
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/ogg',
        'audio/mpeg', 'audio/wav', 'audio/ogg',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 50MB.`);
        return false;
      }

      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} has an unsupported format.`);
        return false;
      }

      return true;
    });

    if (multiple) {
      setSelectedFiles(validFiles);
    } else {
      setSelectedFiles(validFiles.slice(0, 1));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      let response;
      
      if (multiple && selectedFiles.length > 1) {
        response = await uploadAPI.uploadFiles(selectedFiles, setUploadProgress);
        onFileUploaded(response.data.data); // Array of file info
      } else {
        response = await uploadAPI.uploadFile(selectedFiles[0], setUploadProgress);
        onFileUploaded([response.data.data]); // Single file as array
      }

      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type === 'application/pdf') return '📄';
    if (type.includes('document') || type.includes('word')) return '📝';
    return '📎';
  };

  return (
    <div className="media-upload-overlay">
      <div className="media-upload-modal">
        <div className="upload-header">
          <h3>Upload {multiple ? 'Files' : 'File'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="upload-content">
          {/* Drag & Drop Area */}
          <div
            className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="drop-zone-content">
              <span className="upload-icon">📁</span>
              <p>Drag & drop files here or click to browse</p>
              <p className="file-info">
                Supported: Images, Videos, Audio, Documents (Max 50MB)
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: 'none' }}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <h4>Selected Files:</h4>
              <div className="files-list">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <div className="file-info">
                      <span className="file-icon">{getFileIcon(file.type)}</span>
                      <div className="file-details">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{formatFileSize(file.size)}</span>
                      </div>
                    </div>
                    <button
                      className="remove-file"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="progress-text">{uploadProgress}%</span>
            </div>
          )}
        </div>

        <div className="upload-actions">
          <button 
            className="cancel-btn" 
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaUpload;