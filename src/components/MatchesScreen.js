import React, { useState, useEffect } from 'react';
import { supabase, db } from '../supabaseClient';
import { MessageCircle, ArrowLeft, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MatchesScreen = () => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        loadMatches(user.id);
      }
    };
    getUser();
  }, []);

  const loadMatches = async (userId) => {
    try {
      const { data, error } = await db.getMatches(userId);
      if (error) throw error;
      setMatches(data || []);
    } catch (err) {
      console.error('Error loading matches:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getMatchUser = (match) => {
    return match.user1_id === user.id ? match.user2 : match.user1;
  };

  const handleChat = (match) => {
    navigate(`/chat/${match.id}`);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your matches...</p>
      </div>
    );
  }

  return (
    <div className="matches-container">
      <div className="matches-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/swipe')}
        >
          <ArrowLeft size={24} />
        </button>
        <h1>Your Matches</h1>
        <div></div>
      </div>

      {matches.length === 0 ? (
        <div className="no-matches">
          <div className="empty-state">
            <Users size={80} />
            <h2>No matches yet</h2>
            <p>Keep swiping to find your perfect match!</p>
            <button 
              className="submit-btn"
              onClick={() => navigate('/swipe')}
            >
              Start Swiping
            </button>
          </div>
        </div>
      ) : (
        <div className="matches-list">
          {matches.map((match) => {
            const matchUser = getMatchUser(match);
            return (
              <div key={match.id} className="match-item">
                <div className="match-photo">
                  {matchUser.photo_url ? (
                    <img 
                      src={matchUser.photo_url} 
                      alt={matchUser.name}
                      className="match-image"
                    />
                  ) : (
                    <div className="match-placeholder">
                      <Users size={32} />
                    </div>
                  )}
                </div>
                <div className="match-info">
                  <h3>{matchUser.name}</h3>
                  <p className="match-age">{matchUser.age} years old</p>
                  {matchUser.bio && (
                    <p className="match-bio">{matchUser.bio}</p>
                  )}
                  <p className="match-date">
                    Matched {new Date(match.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  className="chat-btn"
                  onClick={() => handleChat(match)}
                >
                  <MessageCircle size={20} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchesScreen;
