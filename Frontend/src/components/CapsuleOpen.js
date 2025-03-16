import React, { useState } from 'react';
import api from '../services/api';
import he from 'he';

function CapsuleOpen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [capsule, setCapsule] = useState(null);
  const [error, setError] = useState('');

  const handleOpenCapsule = async () => {
    setError('');
    setCapsule(null);
    try {
      // Post to /api/capsules/open with email (and password if required)
      const response = await api.post(`/capsules/open`, { email, password });
      setCapsule(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error opening capsule');
    }
  };

  return (
    <div>
      <h2>Open Your Time Capsule</h2>
      <div>
        <input
          type="email"
          placeholder="Enter your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Enter Password (if private)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button onClick={handleOpenCapsule}>Open Capsule</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {capsule && (
        <div>
          <h3>{he.decode(capsule.capsule_name)}</h3>
          <p>{he.decode(capsule.message)}</p>
          {capsule.media_url && (
            <img
              src={capsule.media_url}
              alt="Capsule media"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default CapsuleOpen;