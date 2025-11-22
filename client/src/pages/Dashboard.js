import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import { Users, MessageCircle, TrendingUp, PlusCircle, Brain } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [feedType, setFeedType] = useState('following');
  const [loading, setLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    loadPosts();
  }, [feedType]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = feedType === 'following' 
        ? await postsAPI.getFeedPosts(1)
        : await postsAPI.getAllPosts(1);
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
    setLoading(false);
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreatePost(false);
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => 
      prev.map(post => post._id === updatedPost._id ? updatedPost : post)
    );
  };

  // Safely get user's post count
  const userPostCount = posts.filter(post => 
    post.author && 
    (post.author._id === user?._id || post.author === user?._id)
  ).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg text-white p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-blue-100">
          Connect with fellow {user?.role === 'Student' ? 'students and alumni' : 'alumni and students'} 
          on your journey
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Followers</p>
              <p className="text-2xl font-bold text-gray-900">
                {user?.followers?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Following</p>
              <p className="text-2xl font-bold text-gray-900">
                {user?.following?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Posts</p>
              <p className="text-2xl font-bold text-gray-900">
                {userPostCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <PlusCircle className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-900">Create Post</span>
          </button>

          <Link
            to="/search"
            className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Users className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-900">Find People</span>
          </Link>

          <Link
            to="/messages"
            className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <MessageCircle className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-900">Messages</span>
          </Link>

          <Link
            to="/profile"
            className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <Users className="h-8 w-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-orange-900">My Profile</span>
          </Link>

          <Link
            to="/interview"
            className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <Brain className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-900">AI Interview</span>
          </Link>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="bg-white rounded-lg shadow-md">
        {/* Feed Toggle */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Posts</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setFeedType('following')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  feedType === 'following'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Following
              </button>
              <button
                onClick={() => setFeedType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  feedType === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Discover
              </button>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>
                {feedType === 'following' 
                  ? 'No posts from people you follow. Try following some users or switch to Discover!'
                  : 'No posts available. Be the first to create one!'
                }
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard 
                key={post._id} 
                post={{
                  ...post,
                  // Ensure author is properly formatted
                  author: typeof post.author === 'string' 
                    ? { _id: post.author } 
                    : post.author
                }} 
                onUpdate={handlePostUpdate}
              />
            ))
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost
          onPostCreated={handlePostCreated}
          onClose={() => setShowCreatePost(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;