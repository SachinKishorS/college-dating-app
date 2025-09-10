import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, db } from '../supabaseClient';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';

const ChatScreen = () => {
  const { matchId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [matchUser, setMatchUser] = useState(null);
  const [match, setMatch] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        loadChatData(user.id);
      }
    };
    getUser();
  }, [matchId]);

  const loadChatData = async (userId) => {
    try {
      // Get match details
      const { data: matchData, error: matchError } = await db.getMatches(userId);
      if (matchError) throw matchError;
      
      const currentMatch = matchData?.find(m => m.id === matchId);
      if (!currentMatch) {
        navigate('/matches');
        return;
      }
      
      setMatch(currentMatch);
      setMatchUser(currentMatch.user1_id === userId ? currentMatch.user2 : currentMatch.user1);

      // Load messages
      const { data: messagesData, error: messagesError } = await db.getMessages(matchId);
      if (messagesError) throw messagesError;
      setMessages(messagesData || []);

      // Subscribe to new messages
      const subscription = db.subscribeToMessages(matchId, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      console.error('Error loading chat data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      const { data, error } = await db.sendMessage(matchId, user.id, newMessage.trim());
      if (error) throw error;
      
      setMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  if (!matchUser) {
    return (
      <div className="error-container">
        <h2>Chat not found</h2>
        <button 
          className="submit-btn"
          onClick={() => navigate('/matches')}
        >
          Back to Matches
        </button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button 
          className="back-btn"
          onClick={() => navigate('/matches')}
        >
          <ArrowLeft size={24} />
        </button>
        <div className="chat-user-info">
          {matchUser.photo_url ? (
            <img 
              src={matchUser.photo_url} 
              alt={matchUser.name}
              className="chat-user-photo"
            />
          ) : (
            <div className="chat-user-placeholder">
              <MessageCircle size={20} />
            </div>
          )}
          <div>
            <h3>{matchUser.name}</h3>
            <p className="online-status">Online</p>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <MessageCircle size={48} />
            <p>Start the conversation!</p>
            <p>Send your first message to {matchUser.name}</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.sender_id === user.id ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <p>{message.message_text}</p>
                <span className="message-time">
                  {new Date(message.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message ${matchUser.name}...`}
          className="message-field"
        />
        <button 
          type="submit" 
          className="send-btn"
          disabled={!newMessage.trim()}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatScreen;
