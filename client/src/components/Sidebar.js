import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Users, MessageCircle, Bot, Search, Brain } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/search', label: 'Search', icon: Search },
    { path: '/messages', label: 'Messages', icon: MessageCircle },
    { path: '/chatbot', label: 'AI Assistant', icon: Bot },
    { path: '/interview', label: 'AI Interview', icon: Brain },
  ];

  return (
    <aside className="fixed left-0 top-16 w-64 h-screen bg-white border-r border-gray-200 hidden lg:block">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-gray-200 mt-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h3>
        <div className="space-y-2">
          <Link
            to="/posts/create"
            className="block text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Create Post
          </Link>
          <Link
            to="/profile/edit"
            className="block text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Edit Profile
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;