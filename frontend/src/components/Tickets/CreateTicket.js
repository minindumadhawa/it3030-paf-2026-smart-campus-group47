import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, MapPin, Phone, AlertCircle, ChevronLeft, LogOut, Image as ImageIcon, X, Upload, CheckCircle } from 'lucide-react';
import ticketService from '../../services/ticketService';
import './CreateTicket.css';

const CreateTicket = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    category: '',
    description: '',
    priority: '',
    locationOrResource: '',
    preferredContactDetails: '',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Real-time Validation / Input Masking
    if (name === 'description') {
      const regex = /^[a-zA-Z0-9\s&,.]*$/;
      if (!regex.test(value)) return; // Block illegal symbols
    }
    
    if (name === 'locationOrResource') {
      const regex = /^[a-zA-Z0-9\s.,]*$/;
      if (!regex.test(value)) return; // Block illegal symbols
    }

    if (name === 'preferredContactDetails') {
      const regex = /^[0-9]*$/;
      if (!regex.test(value) || value.length > 10) return; // Block non-digits and > 10 chars
    }

    setFormData({ ...formData, [name]: value });
    setErrorMsg('');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setErrorMsg('');

    if (files.length > 3) {
      setErrorMsg('You can only attach up to 3 images.');
      return;
    }

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      setErrorMsg('Only image files are allowed.');
      return;
    }

    setSelectedFiles(imageFiles);
    const filePreviews = imageFiles.map(file => URL.createObjectURL(file));
    setPreviews(filePreviews);
  };

  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedDesc = formData.description.trim();
    const trimmedLoc = formData.locationOrResource.trim();
    const trimmedContact = formData.preferredContactDetails.trim();

    // Regex Patterns
    const descriptionRegex = /^[a-zA-Z0-9\s&,.]*$/;
    const locationRegex = /^[a-zA-Z0-9\s.,]*$/;
    const contactRegex = /^[0-9]{10}$/;

    if (!formData.category) { setErrorMsg('Please select a category.'); return; }
    if (!formData.priority) { setErrorMsg('Please select a priority.'); return; }
    
    // Description Validation
    if (trimmedDesc.length < 10) {
      setErrorMsg('Description is too short (min 10 chars).');
      return;
    }
    if (!descriptionRegex.test(trimmedDesc)) {
      setErrorMsg('Description contains invalid symbols. Only & , . are allowed.');
      return;
    }

    // Location Validation (optional but must be valid if provided)
    if (trimmedLoc && !locationRegex.test(trimmedLoc)) {
      setErrorMsg('Location contains invalid symbols. Only . , are allowed.');
      return;
    }

    // Contact Validation (optional but must be 10 digits if provided)
    if (trimmedContact && !contactRegex.test(trimmedContact)) {
      setErrorMsg('Contact number must be exactly 10 digits (e.g., 0771234567).');
      return;
    }

    setLoading(true);
    try {
      // 1. Create the Ticket
      const newTicket = await ticketService.createTicket({
        userId: user.id,
        category: formData.category,
        description: trimmedDesc,
        priority: formData.priority,
        locationOrResource: trimmedLoc,
        preferredContactDetails: trimmedContact,
      });

      // 2. Upload Images if any
      if (selectedFiles.length > 0) {
        setSuccessMsg('📤 Ticket created. Uploading evidence...');
        await ticketService.uploadAttachments(newTicket.id, selectedFiles);
      }

      setSuccessMsg('✅ Ticket and evidence submitted successfully! Redirecting...');
      setTimeout(() => navigate('/tickets/my'), 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="ticket-loading">Authenticating...</div>;

  return (
    <div className="ticket-page-container">
      <nav className="ticket-nav">
        <div className="nav-logo">SLIIT Smart Campus</div>
        <div className="nav-links">
          <button className="nav-link-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="nav-link-btn" onClick={() => navigate('/tickets/my')}>My Tickets</button>
          <button className="logout-btn" onClick={() => { localStorage.removeItem('user'); navigate('/login'); }}>
            <LogOut size={16} style={{marginRight: '5px'}}/> Logout
          </button>
        </div>
      </nav>

      <main className="ticket-main">
        <button className="cancel-btn" onClick={() => navigate('/tickets/my')} style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '5px'}}>
          <ChevronLeft size={18}/> Back
        </button>

        <div className="ticket-form-card">
          <div className="form-header">
            <div style={{background: 'var(--primary-orange-light)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--primary-orange)'}}>
              <Wrench size={32} />
            </div>
            <h1>Submit a Ticket</h1>
            <p>Report an issue or maintenance request on campus</p>
          </div>

          {successMsg && <div className="alert-success"><CheckCircle size={20} /> {successMsg}</div>}
          {errorMsg && <div className="alert-error"><AlertCircle size={20} /> {errorMsg}</div>}

          <form onSubmit={handleSubmit} className="ticket-form">
            <div className="form-group">
              <label htmlFor="category">Category <span className="required">*</span></label>
              <select id="category" name="category" value={formData.category} onChange={handleChange}>
                <option value="">-- Select Category --</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="IT_SUPPORT">IT Support</option>
                <option value="CLEANING">Cleaning</option>
                <option value="FACILITY">Facility</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority <span className="required">*</span></label>
              <select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
                <option value="">-- Select Priority --</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description <span className="required">*</span></label>
              <textarea
                id="description"
                name="description"
                rows="4"
                placeholder="Describe the issue in detail..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="locationOrResource">
                <MapPin size={16} style={{verticalAlign: 'middle', marginRight: '5px'}}/> 
                Location / Resource <span className="optional">(optional)</span>
              </label>
              <input
                type="text"
                id="locationOrResource"
                name="locationOrResource"
                placeholder="e.g. Room 201, Lab 3"
                value={formData.locationOrResource}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="preferredContactDetails">
                <Phone size={16} style={{verticalAlign: 'middle', marginRight: '5px'}}/> 
                Preferred Contact <span className="optional">(optional)</span>
              </label>
              <input
                type="text"
                id="preferredContactDetails"
                name="preferredContactDetails"
                placeholder="How should we reach you?"
                value={formData.preferredContactDetails}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label><ImageIcon size={16} style={{verticalAlign: 'middle', marginRight: '5px'}}/> Attach Evidence (Max 3 Images)</label>
              <div className="create-upload-container">
                <label className="create-upload-label">
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} disabled={loading} />
                  <div className="create-upload-btn">
                    <Upload size={18} /> Select Images
                  </div>
                </label>

                {previews.length > 0 && (
                  <div className="create-previews-grid">
                    {previews.map((url, index) => (
                      <div key={index} className="create-preview-item">
                        <img src={url} alt="preview" />
                        <button type="button" className="create-remove-btn" onClick={() => removeFile(index)}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateTicket;
