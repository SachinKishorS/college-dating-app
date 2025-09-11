import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import ProfileSetup from './components/ProfileSetup';
import SwipeInterface from './components/SwipeInterface';
import MatchesScreen from './components/MatchesScreen';
import ChatScreen from './components/ChatScreen';
import './App.css';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, isLoading, profileComplete } = useAuth();

  if (isLoading) {
    // Block everything until auth state is resolved
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
              !user ? (
                <LoginPage />
              ) : !profileComplete ? (
                <Navigate to="/profile-setup" />
              ) : (
                <Navigate to="/swipe" />
              )
            } 
          />
          <Route 
            path="/profile-setup" 
            element={
              !user ? (
                <Navigate to="/" />
              ) : !profileComplete ? (
                <ProfileSetup />
              ) : (
                <Navigate to="/swipe" />
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
