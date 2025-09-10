import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import SignupPage from './components/SignupPage';
import ProfileSetup from './components/ProfileSetup';
import SwipeInterface from './components/SwipeInterface';
import MatchesScreen from './components/MatchesScreen';
import ChatScreen from './components/ChatScreen';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
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
          <Route 
            path="/" 
            element={user ? <Navigate to="/swipe" /> : <SignupPage />} 
          />
          <Route 
            path="/profile-setup" 
            element={user ? <ProfileSetup /> : <Navigate to="/" />} 
          />
          <Route 
            path="/swipe" 
            element={user ? <SwipeInterface /> : <Navigate to="/" />} 
          />
          <Route 
            path="/matches" 
            element={user ? <MatchesScreen /> : <Navigate to="/" />} 
          />
          <Route 
            path="/chat/:matchId" 
            element={user ? <ChatScreen /> : <Navigate to="/" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
