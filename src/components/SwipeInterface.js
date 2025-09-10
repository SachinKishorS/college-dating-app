import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring';
import { useDrag } from 'react-use-gesture';
import { supabase, db } from '../supabaseClient';
import { Heart, X, MessageCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SwipeInterface = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        loadProfiles(user.id);
      }
    };
    getUser();
  }, []);

  const loadProfiles = async (userId) => {
    try {
      const { data, error } = await db.getProfilesToSwipe(userId);
      if (error) throw error;
      setProfiles(data || []);
    } catch (err) {
      console.error('Error loading profiles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (direction) => {
    if (currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];
    
    try {
      await db.createSwipe(user.id, currentProfile.id, direction);
      
      if (direction === 'right') {
        // Check if it's a match
        const { data: matches } = await db.getMatches(user.id);
        const isMatch = matches?.some(match => 
          (match.user1_id === currentProfile.id || match.user2_id === currentProfile.id)
        );
        
        if (isMatch) {
          setMatchedUser(currentProfile);
          setShowMatch(true);
        }
      }
      
      setCurrentIndex(prev => prev + 1);
    } catch (err) {
      console.error('Error creating swipe:', err);
    }
  };

  const bind = useDrag(({ down, movement: [mx], direction: [xDir], velocity: [vx] }) => {
    const trigger = vx > 0.2;
    const dir = xDir < 0 ? -1 : 1;

    if (!down && trigger) {
      handleSwipe(dir === 1 ? 'right' : 'left');
    }

    return {
      x: down ? mx : 0,
      scale: down ? 1.1 : 1,
      rotate: down ? mx / 100 : 0,
    };
  });

  const currentProfile = profiles[currentIndex];

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Finding people near you...</p>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="no-more-profiles">
        <div className="empty-state">
          <Users size={80} />
          <h2>No more profiles!</h2>
          <p>Check back later for more people to meet.</p>
          <button 
            className="submit-btn"
            onClick={() => navigate('/matches')}
          >
            View Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="swipe-container">
      <div className="swipe-header">
        <h1>College Connect</h1>
        <div className="header-actions">
          <button 
            className="icon-btn"
            onClick={() => navigate('/matches')}
          >
            <MessageCircle size={24} />
          </button>
        </div>
      </div>

      <div className="card-stack">
        <animated.div
          {...bind()}
          className="profile-card"
          style={{
            backgroundImage: currentProfile.photo_url 
              ? `url(${currentProfile.photo_url})` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="card-overlay">
            <div className="profile-info">
              <h2>{currentProfile.name}</h2>
              <p className="age">{currentProfile.age}</p>
              {currentProfile.bio && (
                <p className="bio">{currentProfile.bio}</p>
              )}
            </div>
          </div>
        </animated.div>
      </div>

      <div className="swipe-actions">
        <button 
          className="swipe-btn dislike"
          onClick={() => handleSwipe('left')}
        >
          <X size={32} />
        </button>
        <button 
          className="swipe-btn like"
          onClick={() => handleSwipe('right')}
        >
          <Heart size={32} />
        </button>
      </div>

      {showMatch && (
        <div className="match-modal">
          <div className="match-content">
            <h2>It's a Match! 🎉</h2>
            <p>You and {matchedUser.name} liked each other!</p>
            <div className="match-actions">
              <button 
                className="submit-btn"
                onClick={() => {
                  setShowMatch(false);
                  navigate('/matches');
                }}
              >
                Send Message
              </button>
              <button 
                className="secondary-btn"
                onClick={() => setShowMatch(false)}
              >
                Keep Swiping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwipeInterface;
