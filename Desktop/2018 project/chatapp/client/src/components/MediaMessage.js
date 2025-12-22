import React, { useState } from 'react';
import './MediaMessage.css';

const MediaMessage = ({ mediaUrl, mediaType, fileName, fileSize, originalName }) => {
  const [imageError, setImageError] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return '🖼️';
    if (type?.startsWith('video/')) return '🎥';
    if (type?.startsWith('audio/')) return '🎵';
    if (type === 'application/pdf') return '📄';
    if (type?.includes('document') || type?.includes('word')) return '📝';
    return '📎';
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = originalName || fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderMedia = () => {
    if (!mediaType || !mediaUrl) {
      return (
        <div className="media-error">
          <span>❌ Media not available</span>
        </div>
      );
    }

    // Image
    if (mediaType.startsWith('image/')) {
      return (
        <div className="media-image-container">
          {!imageError ? (
            <img
              src={mediaUrl}
              alt={originalName || fileName}
              className="media-image"
              onError={() => setImageError(true)}
              onClick={() => setShowFullscreen(true)}
            />
          ) : (
            <div className="media-error">
              <span>🖼️ Image failed to load</span>
            </div>
          )}
          <div className="media-overlay">
            <button className="media-action" onClick={() => setShowFullscreen(true)}>
              🔍
            </button>
            <button className="media-action" onClick={handleDownload}>
              ⬇️
            </button>
          </div>
        </div>
      );
    }

    // Video
    if (mediaType.startsWith('video/')) {
      return (
        <div className="media-video-container">
          <video
            src={mediaUrl}
            controls
            className="media-video"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
          <div className="media-info">
            <span className="file-name">{originalName || fileName}</span>
            <span className="file-size">{formatFileSize(fileSize)}</span>
          </div>
        </div>
      );
    }

    // Audio
    if (mediaType.startsWith('audio/')) {
      return (
        <div className="media-audio-container">
          <div className="audio-header">
            <span className="audio-icon">🎵</span>
            <div className="audio-info">
              <span className="file-name">{originalName || fileName}</span>
              <span className="file-size">{formatFileSize(fileSize)}</span>
            </div>
          </div>
          <audio
            src={mediaUrl}
            controls
            className="media-audio"
            preload="metadata"
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    // Document/File
    return (
      <div className="media-document-container">
        <div className="document-content">
          <span className="document-icon">{getFileIcon(mediaType)}</span>
          <div className="document-info">
            <span className="file-name">{originalName || fileName}</span>
            <span className="file-size">{formatFileSize(fileSize)}</span>
            <span className="file-type">{mediaType}</span>
          </div>
        </div>
        <button className="download-btn" onClick={handleDownload}>
          ⬇️ Download
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="media-message">
        {renderMedia()}
      </div>

      {/* Fullscreen Image Modal */}
      {showFullscreen && mediaType?.startsWith('image/') && (
        <div className="fullscreen-overlay" onClick={() => setShowFullscreen(false)}>
          <div className="fullscreen-content">
            <img
              src={mediaUrl}
              alt={originalName || fileName}
              className="fullscreen-image"
            />
            <button 
              className="fullscreen-close"
              onClick={() => setShowFullscreen(false)}
            >
              ×
            </button>
            <div className="fullscreen-actions">
              <button onClick={handleDownload}>
                ⬇️ Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MediaMessage;