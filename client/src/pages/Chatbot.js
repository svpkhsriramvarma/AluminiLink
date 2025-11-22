import React, { useState, useEffect, useRef } from 'react';
import { chatbotAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send, Bot, User, Lightbulb, BookOpen, Users, Briefcase } from 'lucide-react';

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `Hello ${user?.name || 'there'}! 👋 I'm your AI assistant here to help with your academic doubts and career guidance. What would you like to know about today?`,
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [currentResponse, setCurrentResponse] = useState('');
  const streamingRef = useRef({ interval: null, words: [], index: 0 });

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentResponse]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startStreamingResponse = (responseText) => {
    // Clear any existing intervals
    if (streamingRef.current.interval) {
      clearInterval(streamingRef.current.interval);
    }
    
    // Initialize streaming state
    const words = responseText.split(' ');
    streamingRef.current = {
      words: words,
      index: 0,
      interval: setInterval(() => {
        if (streamingRef.current.index < streamingRef.current.words.length) {
          const nextWord = streamingRef.current.words[streamingRef.current.index];
          setCurrentResponse(prev => prev ? `${prev} ${nextWord}` : nextWord);
          streamingRef.current.index++;
        } else {
          // Streaming complete
          clearInterval(streamingRef.current.interval);
          streamingRef.current.interval = null;
          
          // Build the final message from all words
          const fullMessage = words.join(' ');
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              type: 'bot',
              content: fullMessage,
              timestamp: new Date()
            }
          ]);
          
          setCurrentResponse('');
          setLoading(false);
        }
      }, 50) // Adjust speed here (milliseconds per word)
    };
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setLoading(true);
    setCurrentResponse(''); // Reset current response

    try {
      const response = await chatbotAPI.sendMessage(newMessage);
      startStreamingResponse(response.message);
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      
      // Clear any active streaming
      if (streamingRef.current.interval) {
        clearInterval(streamingRef.current.interval);
        streamingRef.current.interval = null;
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setNewMessage(question);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (streamingRef.current.interval) {
        clearInterval(streamingRef.current.interval);
      }
    };
  }, []);

  const quickQuestions = [
    {
      icon: BookOpen,
      text: "How do I prepare for technical interviews?",
      color: "bg-blue-100 text-blue-700"
    },
    {
      icon: Briefcase,
      text: "What career paths are available in tech?",
      color: "bg-green-100 text-green-700"
    },
    {
      icon: Users,
      text: "How to build a professional network?",
      color: "bg-purple-100 text-purple-700"
    },
    {
      icon: Lightbulb,
      text: "Tips for learning programming effectively",
      color: "bg-orange-100 text-orange-700"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)]">
      <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Bot size={24} />
            </div>
            <div>
              <h1 className="text-xl font-semibold">AI Assistant</h1>
              <p className="text-blue-100">Your personal guide for academic and career support</p>
            </div>
          </div>
        </div>

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Questions:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {quickQuestions.map((question, index) => {
                const Icon = question.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question.text)}
                    className={`flex items-center space-x-2 p-3 rounded-lg text-sm font-medium transition-colors hover:opacity-80 ${question.color}`}
                  >
                    <Icon size={16} />
                    <span className="text-left">{question.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-3xl ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-blue-600' 
                    : 'bg-gray-100'
                }`}>
                  {message.type === 'user' ? (
                    user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User size={16} className="text-white" />
                    )
                  ) : (
                    <Bot size={16} className="text-gray-600" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`px-4 py-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="prose prose-sm max-w-none">
                    {message.content.split('\n').map((line, index) => (
                      <p key={index} className={`${index > 0 ? 'mt-2' : ''} ${
                        message.type === 'user' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {line}
                      </p>
                    ))}
                  </div>
                  <p className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Streaming response */}
          {currentResponse && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-gray-600" />
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-lg">
                  <div className="prose prose-sm max-w-none">
                    {currentResponse}
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading && !currentResponse && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-gray-600" />
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ask me anything about academics or career guidance..."
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Ask me about study tips, career advice, interview preparation, or any academic doubts!
          </p>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;