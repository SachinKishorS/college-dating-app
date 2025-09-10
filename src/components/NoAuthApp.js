import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { supabase, db } from './supabaseClient';
import SimpleProfileSetup from './components/SimpleProfileSetup';
import SwipeInterface from './components/SwipeInterface';
import MatchesScreen from './components/MatchesScreen';
import ChatScreen from './components/ChatScreen';
import './App.css';

function NoAuthApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Create a simple user ID for demo purposes
    const userId = localStorage.getItem('demo_user_id') || `demo_${Date.now()}`;
    localStorage.setItem('demo_user_id', userId);
    
    setCurrentUser({ id: userId, email: 'demo@rvce.edu.in' });
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SimpleProfileSetup />} />
          <Route path="/profile-setup" element={<SimpleProfileSetup />} />
          <Route path="/swipe" element={<SwipeInterface />} />
          <Route path="/matches" element={<MatchesScreen />} />
          <Route path="/chat/:matchId" element={<ChatScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default NoAuthApp;
