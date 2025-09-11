import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, db } from '../supabaseClient';
import { Camera, User, Calendar, MessageSquare } from 'lucide-react';

const ProfileSetup = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bio: '',
    photo1: null,
    photo2: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const { name, files } = e.target;
    const file = files && files[0] ? files[0] : null;
    setFormData(prev => ({
      ...prev,
      [name]: file
    }));
  };

  const uploadPhoto = async (file, index) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}_${index}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!formData.photo1 || !formData.photo2) {
        throw new Error('Please select two photos');
      }

      const [photoUrl1, photoUrl2] = await Promise.all([
        uploadPhoto(formData.photo1, 1),
        uploadPhoto(formData.photo2, 2)
      ]);

      // First try to update existing profile, if that fails, create new one
      let { error: profileError } = await db.updateProfile(user.id, {
        name: formData.name,
        age: parseInt(formData.age),
        bio: formData.bio,
        photo_url_1: photoUrl1,
        photo_url_2: photoUrl2
      });

      if (profileError) {
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            name: formData.name,
            age: parseInt(formData.age),
            bio: formData.bio,
            photo_url_1: photoUrl1,
            photo_url_2: photoUrl2
          });
        if (createError) throw createError;
      }

      window.location.href = '/swipe';
    } catch (err) {
      console.error('Profile setup error:', err);
      setError(err.message || 'Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className="loading-container">Loading...</div>;
  }

  const isSubmitDisabled = isLoading || !formData.name || !formData.age || !formData.photo1 || !formData.photo2;

  return (
    <div className="container">
      <div className="profile-setup">
        <h1>Complete Your Profile</h1>
        <p className="subtitle">Add two photos to get started</p>

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

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="photo1" className="photo-upload">
              <div className="photo-preview">
                {formData.photo1 ? (
                  <img 
                    src={URL.createObjectURL(formData.photo1)} 
                    alt="Preview 1" 
                    className="preview-image"
                  />
                ) : (
                  <div className="photo-placeholder">
                    <Camera size={40} />
                    <span>Add Photo 1</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                id="photo1"
                name="photo1"
                accept="image/*"
                onChange={handlePhotoChange}
                className="photo-input"
                required
              />
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="photo2" className="photo-upload">
              <div className="photo-preview">
                {formData.photo2 ? (
                  <img 
                    src={URL.createObjectURL(formData.photo2)} 
                    alt="Preview 2" 
                    className="preview-image"
                  />
                ) : (
                  <div className="photo-placeholder">
                    <Camera size={40} />
                    <span>Add Photo 2</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                id="photo2"
                name="photo2"
                accept="image/*"
                onChange={handlePhotoChange}
                className="photo-input"
                required
              />
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="name">
              <User size={20} />
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">
              <Calendar size={20} />
              Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              placeholder="Enter your age"
              min="18"
              max="100"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">
              <MessageSquare size={20} />
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself..."
              rows="4"
              maxLength="500"
            />
            <div className="char-count">{formData.bio.length}/500</div>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitDisabled}
          >
            {isLoading ? 'Creating Profile...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;