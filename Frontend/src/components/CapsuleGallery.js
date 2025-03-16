import React, { useState, useEffect } from 'react';
import api from '../services/api';

function CapsuleGallery() {
  const [capsules, setCapsules] = useState([]);
  const [filter, setFilter] = useState('recent');
  const [loading, setLoading] = useState(false);

  const fetchCapsules = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/capsules/public?filter=${filter}&limit=10`);
      setCapsules(response.data);
    } catch (error) {
      console.error('Error fetching public capsules:', error);
      setCapsules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCapsules();

    // Refresh gallery when a new capsule is created
    const handleCapsuleCreated = () => {
      fetchCapsules();
    };
    window.addEventListener('capsuleCreated', handleCapsuleCreated);

    return () => {
      window.removeEventListener('capsuleCreated', handleCapsuleCreated);
    };
  }, [filter]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="gallery-container">
      <h2 className="gallery-heading">Public Capsules</h2>

      <div className="filter-container">
        <label htmlFor="filter-select">Filter by:</label>
        <select
          id="filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="recent">Most Recent</option>
          <option value="popular">Most Popular</option>
          <option value="random">Random</option>
          <option value="year2030">Opening in 2030</option>
          <option value="year2050">Opening in 2050</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading capsules...</div>
      ) : (
        <ul className="capsules-list">
          {capsules.length > 0 ? (
            capsules.map((capsule) => (
              <li key={capsule.id} className="capsule-item">
                <h3 className="capsule-title">{capsule.capsule_name}</h3>
                <div className="capsule-meta">
                  <span>Opening on: {formatDate(capsule.unlock_date)}</span>
                </div>
                <div className="capsule-preview">{capsule.public_preview}</div>
              </li>
            ))
          ) : (
            <div className="no-capsules">
              <p>No public capsules found.</p>
              <p>Be the first to create one!</p>
            </div>
          )}
        </ul>
      )}
    </div>
  );
}

export default CapsuleGallery;