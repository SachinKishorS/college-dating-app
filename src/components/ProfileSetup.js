import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileSetup = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="logo">🎉</div>
      <h1>Welcome to College Connect!</h1>
      <p className="subtitle">Your account has been created successfully</p>
      
      <div style={{ 
        background: '#d4edda', 
        color: '#155724', 
        padding: '20px', 
        borderRadius: '10px', 
        marginBottom: '30px',
        border: '1px solid #c3e6cb'
      }}>
        <h3>Next Steps:</h3>
        <ul style={{ textAlign: 'left', marginTop: '10px' }}>
          <li>Check your email for verification link</li>
          <li>Complete your profile setup</li>
          <li>Start connecting with other RVCE students!</li>
        </ul>
      </div>
      
      <button 
        className="submit-btn"
        onClick={() => navigate('/')}
        style={{ marginBottom: '20px' }}
      >
        Back to Sign Up
      </button>
      
      <p style={{ color: '#666', fontSize: '14px' }}>
        Profile setup page coming soon...
      </p>
    </div>
  );
};

export default ProfileSetup;
