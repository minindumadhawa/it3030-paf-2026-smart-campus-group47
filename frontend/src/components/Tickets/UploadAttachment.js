import React, { useState } from 'react';
import { Image, X, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import ticketService from '../../services/ticketService';
import './UploadAttachment.css';

const UploadAttachment = ({ ticketId, onUploadSuccess, currentAttachmentCount }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const maxAllowed = 3 - currentAttachmentCount;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Clear previous messages
    setMessage({ type: '', text: '' });

    if (files.length > maxAllowed) {
      setMessage({ type: 'error', text: `You can only add ${maxAllowed} more image(s).` });
      return;
    }

    // Filter only images
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      setMessage({ type: 'error', text: 'Only image files are allowed.' });
      return;
    }

    setSelectedFiles(imageFiles);

    // Create previews
    const filePreviews = imageFiles.map(file => URL.createObjectURL(file));
    setPreviews(filePreviews);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      await ticketService.uploadAttachments(ticketId, selectedFiles);
      setMessage({ type: 'success', text: 'Images uploaded successfully!' });
      setSelectedFiles([]);
      setPreviews([]);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  if (currentAttachmentCount >= 3) {
    return (
      <div className="upload-limit-reached">
        <CheckCircle size={20} className="icon-green" /> Maximum attachments (3) reached.
      </div>
    );
  }

  return (
    <div className="upload-attachment-section">
      <div className="upload-box">
        <label className="file-input-label">
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleFileChange}
            disabled={uploading}
          />
          <div className="upload-placeholder">
            <Image size={32} />
            <span>Select up to {maxAllowed} images</span>
          </div>
        </label>

        {previews.length > 0 && (
          <div className="upload-previews">
            {previews.map((url, index) => (
              <div key={index} className="preview-item">
                <img src={url} alt="preview" />
                <button 
                  className="remove-preview" 
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedFiles.length > 0 && (
          <button 
            className="upload-submit-btn" 
            onClick={handleUpload} 
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
          </button>
        )}

        {message.text && (
          <div className={`upload-message ${message.type}`}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadAttachment;
