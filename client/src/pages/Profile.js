import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI, postsAPI } from '../services/api';
import PostCard from '../components/PostCard';
import { useNavigate } from 'react-router-dom'; // Changed from useHistory to useNavigate
import { 
  Edit2, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Users, 
  MessageSquare,
  Save,
  X
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // Changed from useHistory to useNavigate
  const [profile, setProfile] = useState(user);
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills || [],
    graduationYear: user?.graduationYear || '',
    currentPosition: user?.currentPosition || '',
    company: user?.company || '',
    profilePicture: user?.profilePicture || ''
  });

  useEffect(() => {
    loadUserPosts();
  }, [user]);

  const loadUserPosts = async () => {
    try {
      if (!user?._id) return;
      const userPosts = await postsAPI.getUserPosts(user._id);
      setPosts(userPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedProfile = await usersAPI.updateProfile(editData);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    setLoading(false);
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setEditData(prev => ({ ...prev, skills }));
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => 
      prev.map(post => post._id === updatedPost._id ? updatedPost : post)
    );
  };

  // Updated to use navigate instead of history.push
  const handleMessageClick = () => {
    navigate('/messages');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        
        {/* Profile Content */}
        <div className="relative px-6 pb-6">
          {/* Profile Picture */}
          <div className="flex items-end -mt-16 mb-4">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                <div className="w-full h-full bg-blue-600 rounded-full flex items-center justify-center">
                  {profile?.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt={profile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {profile?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Edit Button */}
            <div className="ml-auto flex space-x-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={handleMessageClick}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MessageSquare size={16} />
                    <span>Message</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit2 size={16} />
                    <span>Edit Profile</span>
                  </button>
                </>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Rest of the component remains the same */}
          {/* ... */}
        </div>
      </div>

      {/* Posts Section */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">My Posts</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {posts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
              <p>You haven't created any posts yet.</p>
              <p className="text-sm">Share your thoughts and connect with others!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                onUpdate={handlePostUpdate}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;