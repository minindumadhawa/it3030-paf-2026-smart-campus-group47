import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserResourceView.css';

const UserResourceView = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
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
        // Only show available (ACTIVE) resources to users
        const available = data.filter(r => r.status === 'ACTIVE');
        setResources(available);
      }
    } catch (err) {
      console.error("Failed to fetch resources", err);
    }
  };

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
    <div className="urv-container">
      <nav className="urv-nav">
        <div className="nav-logo" onClick={() => navigate('/dashboard')} style={{cursor: 'pointer', fontSize: '20px', fontWeight: '700', color: '#f97316'}}>
          Smart Campus Hub
        </div>
        <button className="back-btn-user" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
      </nav>

      <main className="urv-main">
        <header className="urv-header">
          <h1>Browse Available Resources</h1>
          <p>Explore facilities and equipment currently available for use.</p>
        </header>

        <div className="urv-table-card premium-glass">
            <div className="urv-filters">
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
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
              />
              
              <input 
                type="number" 
                placeholder="Min Capacity" 
                value={filterMinCapacity}
                onChange={(e) => setFilterMinCapacity(e.target.value)}
                min="0"
              />
              
              <button className="clear-btn" onClick={() => { setFilterType('ALL'); setFilterLocation(''); setFilterMinCapacity(''); }}>
                Clear Filters
              </button>
            </div>
            
            <div className="table-responsive">
              <table className="urv-table">
                <thead>
                  <tr>
                    <th>Resource Name</th>
                    <th>Category</th>
                    <th>Capacity</th>
                    <th>Location</th>
                    <th>Available Times</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResources.length === 0 ? (
                    <tr><td colSpan="5" className="empty-state">No matching resources currently available.</td></tr>
                  ) : (
                    filteredResources.map(res => (
                      <tr key={res.id}>
                        <td><strong>{res.name}</strong></td>
                        <td>
                           <span className="category-pill">{res.type.replace('_', ' ')}</span>
                        </td>
                        <td>{res.capacity || 'N/A'}</td>
                        <td>{res.location}</td>
                        <td className="time-col">{res.availabilityWindows}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        </div>
      </main>
    </div>
  );
};

export default UserResourceView;
