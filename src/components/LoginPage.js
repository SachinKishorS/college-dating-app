import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      setIsLoading(false);
      return;
    }

    try {
      if (isSignup) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            emailRedirectTo: undefined,
            data: { created_via: 'login_page' }
          }
        });

        if (error) throw error;

        // Immediately redirect to profile setup after signup
        window.location.href = '/profile-setup';
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) throw error;

        // Immediately redirect to profile setup to avoid extra fetch delay
        window.location.href = '/profile-setup';
      }
    } catch (err) {
      console.error('Auth error:', err);
      let errorMsg = 'An error occurred. Please try again.';
      
      if (err.message.includes('already registered')) {
        errorMsg = 'This email is already registered. Please sign in instead.';
      } else if (err.message.includes('Invalid login credentials')) {
        errorMsg = 'Invalid email or password. Please try again.';
      } else if (err.message.includes('Password should be at least')) {
        errorMsg = 'Password must be at least 6 characters long.';
      } else {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>College Connect</h1>
      <p className="subtitle">
        {isSignup ? 'Create your account' : 'Welcome back'}
      </p>

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
          <label htmlFor="email">RVCE Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.name@rvce.edu.in"
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={isLoading}
            required
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading"></span>
              {isSignup ? 'Creating Account...' : 'Signing In...'}
            </>
          ) : (
            isSignup ? 'Create Account' : 'Sign In'
          )}
        </button>
      </form>

      <div className="login-link">
        {isSignup ? (
          <>
            Already have an account?{' '}
            <button 
              type="button"
              onClick={() => setIsSignup(false)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#ff6b6b', 
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Sign in
            </button>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <button 
              type="button"
              onClick={() => setIsSignup(true)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#ff6b6b', 
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Sign up
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
