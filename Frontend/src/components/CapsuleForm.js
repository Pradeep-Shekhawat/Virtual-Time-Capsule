import React, { useState } from 'react';
import api from '../services/api';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_green.css';

function CapsuleForm({ refreshGallery }) {
  const [capsuleType, setCapsuleType] = useState('private');
  const [capsuleName, setCapsuleName] = useState('');
  const [email, setEmail] = useState('');
  const [unlockDate, setUnlockDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1))
  );
  const [message, setMessage] = useState('');
  const [publicPreview, setPublicPreview] = useState('');
  const [password, setPassword] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  // Formats a Date object to YYYY-MM-DD (local time)
  function formatDateLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Private capsules must have a password
    if (capsuleType === 'private' && !password) {
      alert('Password is required for private capsules.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('capsuleType', capsuleType);
    formData.append('capsuleName', capsuleName);
    formData.append('email', email);
    formData.append('unlockDate', formatDateLocal(unlockDate));
    formData.append('message', message);

    if (capsuleType === 'public') {
      formData.append('publicPreview', publicPreview);
    }
    if (capsuleType === 'private' && password) {
      formData.append('password', password);
    }
    if (mediaFile) {
      formData.append('mediaFile', mediaFile);
    }

    try {
      const response = await api.post('/capsules', formData);
      if (response.data) {
        setSuccessMessage('Your time capsule has been successfully buried!');
        refreshGallery();

        // Reset form fields
        setCapsuleName('');
        setEmail('');
        setUnlockDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1)));
        setMessage('');
        setPublicPreview('');
        setPassword('');
        setMediaFile(null);
        setFileName('');

        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error creating capsule:', error);
      alert('Failed to create your time capsule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {successMessage && (
        <div id="successMessage">
          <p>{successMessage}</p>
        </div>
      )}

      <div className="form-group capsule-type">
        <input
          type="radio"
          id="private"
          name="capsuleType"
          value="private"
          checked={capsuleType === 'private'}
          onChange={() => setCapsuleType('private')}
        />
        <label htmlFor="private">Private Capsule</label>

        <input
          type="radio"
          id="public"
          name="capsuleType"
          value="public"
          checked={capsuleType === 'public'}
          onChange={() => setCapsuleType('public')}
        />
        <label htmlFor="public">Public Capsule</label>
      </div>

      <div className="form-group">
        <label htmlFor="capsuleName">Capsule Name</label>
        <input
          type="text"
          id="capsuleName"
          value={capsuleName}
          onChange={(e) => setCapsuleName(e.target.value)}
          placeholder="Give your capsule a memorable name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Your Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="We'll notify you when it's time to open"
          required
        />
      </div>

      {capsuleType === 'private' && (
        <div className="form-group">
          <label htmlFor="password">Password (to open your capsule)</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a secure password"
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="unlockDate">When should this capsule be opened?</label>
        <Flatpickr
          id="unlockDate"
          value={unlockDate}
          onChange={(date) => setUnlockDate(date[0])}
          options={{
            minDate: 'today',
            dateFormat: 'Y-m-d'
          }}
          className="date-picker"
        />
      </div>

      <div className="form-group">
        <label htmlFor="message">Your Message</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What would you like to tell your future self or others?"
          required
        />
      </div>

      {capsuleType === 'public' && (
        <div className="form-group">
          <label htmlFor="publicPreview">Public Preview</label>
          <textarea
            id="publicPreview"
            value={publicPreview}
            onChange={(e) => setPublicPreview(e.target.value)}
            placeholder="A short teaser visible to everyone (optional)"
          />
        </div>
      )}

      <div className="form-group">
        <label>Attach Media (Optional)</label>
        <div className="upload-btn-wrapper">
          <button type="button" className="btn-upload">Choose File</button>
          <input
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={handleFileChange}
          />
        </div>
        {fileName && (
          <div className="file-info">Selected file: {fileName}</div>
        )}
      </div>

      <button type="submit" className="btn btn-full" disabled={loading}>
        {loading ? 'Burying Time Capsule...' : 'Bury Time Capsule'}
      </button>
    </form>
  );
}

export default CapsuleForm;