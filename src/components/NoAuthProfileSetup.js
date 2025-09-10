import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const NoAuthProfileSetup = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bio: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const userId = localStorage.getItem('demo_user_id') || `demo_${Date.now()}`;
      localStorage.setItem('demo_user_id', userId);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: formData.name,
          age: parseInt(formData.age),
          bio: formData.bio,
          photo_url: ''
        });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/swipe';
      }, 2000);
    } catch (err) {
      console.error('Profile setup error:', err);
      setError(err.message || 'Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container">
        <h1>Profile Created Successfully!</h1>
        <p>Redirecting to the app...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Complete Your Profile</h1>
      <p className="subtitle">Tell us about yourself to get started</p>

      {error && (
        <div className="error-message" style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="Enter your age"
            min="18"
            max="100"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Tell us about yourself..."
            rows="4"
            maxLength="500"
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Profile...' : 'Complete Profile'}
        </button>
      </form>
    </div>
  );
};

export default NoAuthProfileSetup;
