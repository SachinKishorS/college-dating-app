import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignupPage from './components/SignupPage';
import ProfileSetup from './components/ProfileSetup';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SignupPage />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
