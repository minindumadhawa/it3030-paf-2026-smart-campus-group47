import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResourceManagement.css';

const ResourceManagement = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState({
    name: '', type: 'LECTURE_HALL', capacity: '', location: '', availabilityWindows: '', status: 'ACTIVE'
  });
  const [editId, setEditId] = useState(null);
  const [notification, setNotification] = useState('');

  // Filtering states
  const [filterType, setFilterType] = useState('ALL');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterMinCapacity, setFilterMinCapacity] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/resources');
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      }
    } catch (err) {
      console.error("Failed to fetch resources", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isUpdate = editId !== null;
    const url = isUpdate ? `http://localhost:8080/api/resources/${editId}` : 'http://localhost:8080/api/resources';
    const method = isUpdate ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setNotification(isUpdate ? 'Resource updated successfully!' : 'Resource added successfully!');
        setFormData({ name: '', type: 'LECTURE_HALL', capacity: '', location: '', availabilityWindows: '', status: 'ACTIVE' });
        setEditId(null);
        fetchResources();
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (err) {
      setNotification('An error occurred while saving.');
    }
  };

  const handleEdit = (resource) => {
    setFormData(resource);
    setEditId(resource.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      const response = await fetch(`http://localhost:8080/api/resources/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setNotification('Resource deleted.');
        fetchResources();
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter Computation
  const filteredResources = resources.filter(res => {
    let matchType = filterType === 'ALL' || res.type === filterType;
    let matchLocation = filterLocation.trim() === '' || (res.location && res.location.toLowerCase().includes(filterLocation.toLowerCase()));
    
    let matchCapacity = true;
    if (filterMinCapacity !== '') {
      const minCap = parseInt(filterMinCapacity, 10);
      const resCap = res.capacity ? parseInt(res.capacity, 10) : 0;
      matchCapacity = resCap >= minCap;
    }

    return matchType && matchLocation && matchCapacity;
  });

  return (
    <div className="rm-container">
      <nav className="rm-nav">
        <div className="nav-logo" onClick={() => navigate('/admin-dashboard')} style={{cursor: 'pointer'}}>
          Smart Campus <span>| Admin Control</span>
        </div>
        <button className="back-btn" onClick={() => navigate('/admin-dashboard')}>← Back to Dashboard</button>
      </nav>

      <main className="rm-main">
        <header className="rm-header">
          <h1>Manage Resources Catalogue</h1>
          <p>Maintain lecture halls, labs, meeting rooms, and equipment.</p>
        </header>

        {notification && <div className="rm-notification">{notification}</div>}

        <div className="rm-content-grid">
          <div className="rm-form-card premium-glass-admin">
            <h3>{editId ? 'Edit Resource' : 'Add New Resource'}</h3>
            <form onSubmit={handleSubmit} className="rm-form">
              <div className="form-group">
                <label>Resource Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Hall A" />
              </div>
              <div className="form-group">
                <label>Resource Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option value="LECTURE_HALL">Lecture Hall</option>
                  <option value="LAB">Lab</option>
                  <option value="MEETING_ROOM">Meeting Room</option>
                  <option value="EQUIPMENT">Equipment</option>
                </select>
              </div>
              <div className="form-group">
                <label>Capacity</label>
                <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} placeholder="e.g. 50" />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="e.g. Building C, Floor 2" />
              </div>
              <div className="form-group">
                <label>Availability Windows</label>
                <input type="text" name="availabilityWindows" value={formData.availabilityWindows} onChange={handleChange} required placeholder="e.g. 08:00 - 18:00" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="save-btn">{editId ? 'Update Resource' : 'Add Resource'}</button>
                {editId && <button type="button" className="cancel-btn" onClick={() => { setEditId(null); setFormData({ name: '', type: 'LECTURE_HALL', capacity: '', location: '', availabilityWindows: '', status: 'ACTIVE' }); }}>Cancel</button>}
              </div>
            </form>
          </div>

          <div className="rm-table-card premium-glass-admin">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '15px', gap: '15px' }}>
              <h3 style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>Current Catalogue</h3>
              
              <div className="filters-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{ background: 'rgba(15, 23, 42, 0.6)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}
                >
                  <option value="ALL">All Types</option>
                  <option value="LECTURE_HALL">Lecture Hall</option>
                  <option value="LAB">Lab</option>
                  <option value="MEETING_ROOM">Meeting Room</option>
                  <option value="EQUIPMENT">Equipment</option>
                </select>
                
                <input 
                  type="text" 
                  placeholder="Search Location..." 
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  style={{ background: 'rgba(15, 23, 42, 0.6)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px' }}
                />
                
                <input 
                  type="number" 
                  placeholder="Min Capacity" 
                  value={filterMinCapacity}
                  onChange={(e) => setFilterMinCapacity(e.target.value)}
                  style={{ background: 'rgba(15, 23, 42, 0.6)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 12px', borderRadius: '6px', width: '110px', fontSize: '13px' }}
                  min="0"
                />
                
                <button 
                  onClick={() => { setFilterType('ALL'); setFilterLocation(''); setFilterMinCapacity(''); }}
                  style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(244, 63, 94, 0.2)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                >
                  Clear Filters
                </button>
              </div>
            </div>
            
            <div className="table-responsive">
              <table className="rm-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResources.length === 0 ? (
                    <tr><td colSpan="6" className="empty-state">No matching resources found.</td></tr>
                  ) : (
                    filteredResources.map(res => (
                      <tr key={res.id}>
                        <td>{res.name}</td>
                        <td>{res.type.replace('_', ' ')}</td>
                        <td>{res.capacity || 'N/A'}</td>
                        <td>{res.location}</td>
                        <td>
                          <span className={`status-pill ${res.status === 'ACTIVE' ? 'active-pill' : 'out-pill'}`}>
                            {res.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button className="edit-btn" onClick={() => handleEdit(res)}>Edit</button>
                          <button className="delete-btn" onClick={() => handleDelete(res.id)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResourceManagement;
