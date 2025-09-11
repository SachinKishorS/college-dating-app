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
    let isMounted = true;

    const setProfileStatus = async (theUser) => {
      if (!theUser) {
        if (isMounted) setProfileComplete(false);
        return;
      }
      const { data: profile } = await db.getProfile(theUser.id);
      if (isMounted) {
        const isComplete = Boolean(
          profile && profile.name && profile.age && profile.photo_url_1 && profile.photo_url_2
        );
        setProfileComplete(isComplete);
      }
    };

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      if (isMounted) setUser(currentUser);
      await setProfileStatus(currentUser);
      if (isMounted) setIsLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const nextUser = session?.user ?? null;
        if (isMounted) setUser(nextUser);
        await setProfileStatus(nextUser);
        if (isMounted) setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
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
