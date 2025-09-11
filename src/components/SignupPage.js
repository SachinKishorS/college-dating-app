import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate();

  // Validate email format and domain
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    if (!email.endsWith('@rvce.edu.in')) {
      return 'Email must end with @rvce.edu.in';
    }
    return '';
  };

  // Validate password
  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  };

  // Handle email input change
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError('');
    setErrorMessage('');
  };

  // Handle password input change
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError('');
    setErrorMessage('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset previous messages
    setErrorMessage('');
    setSuccessMessage('');
    
    // Validate inputs
    const emailValidationError = validateEmail(email);
    const passwordValidationError = validatePassword(password);
    
    if (emailValidationError) {
      setEmailError(emailValidationError);
    }
    
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
    }
    
    // If there are validation errors, don't proceed
    if (emailValidationError || passwordValidationError) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Attempt to sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: undefined,
          data: { created_via: 'signup_page' }
        }
      });
      
      if (error) {
        // Handle Supabase errors
        let errorMsg = 'An error occurred during signup. Please try again.';
        
        if (error.message.includes('already registered')) {
          errorMsg = 'This email is already registered. Please try logging in instead.';
        } else if (error.message.includes('Invalid email')) {
          errorMsg = 'Please enter a valid email address.';
        } else if (error.message.includes('Password should be at least')) {
          errorMsg = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('Unable to validate email address')) {
          errorMsg = 'Unable to validate email address. Please check your email and try again.';
        } else {
          errorMsg = error.message;
        }
        
        setErrorMessage(errorMsg);
      } else {
        // Success: redirect immediately to profile setup
        setEmail('');
        setPassword('');
        navigate('/profile-setup');
      }
    } catch (err) {
      // Handle unexpected errors
      console.error('Signup error:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Updated without heart symbol */}
      <h1>College Connect</h1>
      <p className="subtitle">Join the RVCE dating community</p>
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="error-message" style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">College Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="your.name@rvce.edu.in"
            className={emailError ? 'error' : ''}
            disabled={isLoading}
            required
          />
          {emailError && (
            <div className="error-message">{emailError}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter your password"
            className={passwordError ? 'error' : ''}
            disabled={isLoading}
            required
          />
          {passwordError && (
            <div className="error-message">{passwordError}</div>
          )}
        </div>
        
        <button 
          type="submit" 
          className="submit-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading"></span>
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>
      
      <div className="login-link">
        Already have an account? <a href="/login">Sign in</a>
      </div>
    </div>
  );
};

export default SignupPage;
