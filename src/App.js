import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase, db } from './supabaseClient';
import LoginPage from './components/LoginPage';
import ProfileSetup from './components/ProfileSetup';
import SwipeInterface from './components/SwipeInterface';
import MatchesScreen from './components/MatchesScreen';
import ChatScreen from './components/ChatScreen';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Check if profile is complete
        const { data: profile } = await db.getProfile(user.id);
        setProfileComplete(profile && profile.name && profile.age);
      }
      
      setIsLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if profile is complete
          const { data: profile } = await db.getProfile(session.user.id);
          setProfileComplete(profile && profile.name && profile.age);
        } else {
          setProfileComplete(false);
        }
        
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
            element={
              user ? (
                profileComplete ? (
                  <Navigate to="/swipe" />
                ) : (
                  <Navigate to="/profile-setup" />
                )
              ) : (
                <LoginPage />
              )
            } 
          />
          <Route 
            path="/profile-setup" 
            element={
              user ? (
                profileComplete ? (
                  <Navigate to="/swipe" />
                ) : (
                  <ProfileSetup />
                )
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/swipe" 
            element={
              user && profileComplete ? (
                <SwipeInterface />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/matches" 
            element={
              user && profileComplete ? (
                <MatchesScreen />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/chat/:matchId" 
            element={
              user && profileComplete ? (
                <ChatScreen />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
