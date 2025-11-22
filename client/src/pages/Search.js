import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search as SearchIcon, Users, UserPlus, UserCheck } from 'lucide-react';

const Search = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingUsers, setFollowingUsers] = useState(new Set());

  useEffect(() => {
    if (user?.following) {
      setFollowingUsers(new Set(user.following.map(f => f._id || f)));
    }
  }, [user]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, roleFilter]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await usersAPI.searchUsers(searchQuery, roleFilter);
      // Filter out current user from results
      const filteredResults = results.filter(result => result._id !== user?.id);
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    }
    setLoading(false);
  };

  const handleFollow = async (userId) => {
    try {
      const response = await usersAPI.followUser(userId);
      
      if (response.isFollowing) {
        setFollowingUsers(prev => new Set([...prev, userId]));
      } else {
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleMessage = (userId) => {
    navigate(`/messages?user=${userId}`);
  };
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Find People</h1>
        
        {/* Search Form */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by name..."
            />
          </div>

          {/* Role Filter */}
          <div className="flex space-x-2">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setRoleFilter('Student')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'Student'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setRoleFilter('Alumni')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                roleFilter === 'Alumni'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Alumni
            </button>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Start typing to search for people'}
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Searching...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? (
                <>
                  <Users size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No users found matching your search.</p>
                  <p className="text-sm">Try adjusting your search terms or filters.</p>
                </>
              ) : (
                <>
                  <SearchIcon size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Enter a name to search for students and alumni.</p>
                </>
              )}
            </div>
          ) : (
            searchResults.map((searchUser) => (
              <div key={searchUser._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Link to={`/user/${searchUser._id}`}>
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                        {searchUser.profilePicture ? (
                          <img
                            src={searchUser.profilePicture}
                            alt={searchUser.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-xl font-bold">
                            {searchUser.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="flex-1">
                      <Link
                        to={`/user/${searchUser._id}`}
                        className="block hover:text-blue-600 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-gray-900">
                          {searchUser.name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {searchUser.role}
                        </span>
                        {searchUser.currentPosition && (
                          <span className="text-sm text-gray-600">
                            {searchUser.currentPosition}
                            {searchUser.company && ` at ${searchUser.company}`}
                          </span>
                        )}
                      </div>

                      {searchUser.bio && (
                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                          {searchUser.bio}
                        </p>
                      )}

                      {searchUser.skills && searchUser.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {searchUser.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {searchUser.skills.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{searchUser.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{searchUser.followers?.length || 0} followers</span>
                        <span>{searchUser.following?.length || 0} following</span>
                      </div>
                    </div>
                  </div>

                  {/* Follow Button */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleFollow(searchUser._id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        followingUsers.has(searchUser._id)
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {followingUsers.has(searchUser._id) ? (
                        <>
                          <UserCheck size={16} />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          <span>Follow</span>
                        </>
                      )}
                    </button>

                    <Link
                      to={`/user/${searchUser._id}`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      View Profile
                    </Link>

                    <button
                      onClick={() => handleMessage(searchUser._id)}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      Message
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;