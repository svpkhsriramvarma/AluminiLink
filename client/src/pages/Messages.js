import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { messagesAPI, usersAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Send,
  Search as SearchIcon,
  MessageCircle,
  Users,
  Paperclip,
  FileText,
  Image as ImageIcon,
  X,
  Download,
} from "lucide-react";
import io from "socket.io-client";

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // File download handler
  const handleFileDownload = async (fileUrl, fileName) => {
    try {
      // Ensure we have a proper URL
      let downloadUrl = fileUrl;
      if (!fileUrl.startsWith("http")) {
        // If it's a relative URL, prepend the server URL
        downloadUrl = `http://localhost:5000${fileUrl}`;
      }

      // First check if file exists by making a HEAD request
      const checkResponse = await fetch(downloadUrl, { method: 'HEAD' });
      if (!checkResponse.ok) {
        throw new Error(`File not found: ${checkResponse.status}`);
      }

      // Create a hidden anchor element for download
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName || "download";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert(`Failed to download file: ${error.message}. Please try again.`);
    }
  };
  useEffect(() => {
    loadConversations();

    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.emit("join", user.id);

    newSocket.on("receiveMessage", (messageData) => {
      if (
        selectedConversation &&
        (messageData.sender === selectedConversation.user._id ||
          messageData.recipient === selectedConversation.user._id)
      ) {
        setMessages((prev) => [...prev, messageData]);
      }
      loadConversations();
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user.id]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const results = await usersAPI.searchUsers(searchQuery, "all");
        const filteredResults = results.filter(
          (result) =>
            result._id !== user?.id &&
            !conversations.some((conv) => conv.user._id === result._id)
        );
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      }
      setSearchLoading(false);
    };

    const timerId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timerId);
  }, [searchQuery, conversations, user]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const targetUserId = urlParams.get("user");

    if (targetUserId && conversations.length > 0) {
      const existingConversation = conversations.find(
        (conv) => conv.user._id === targetUserId
      );

      if (existingConversation) {
        handleConversationSelect(existingConversation);
      } else {
        startNewConversation(targetUserId);
      }

      navigate("/messages", { replace: true });
    }
  }, [conversations, location.search]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    setConversationsLoading(true);
    try {
      const data = await messagesAPI.getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Error loading conversations:", error);
      setConversations([]);
    }
    setConversationsLoading(false);
  };

  const startNewConversation = async (targetUserId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${targetUserId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const targetUser = await response.json();
        const newConversation = {
          user: {
            _id: targetUser._id,
            name: targetUser.name,
            profilePicture: targetUser.profilePicture,
            role: targetUser.role,
          },
          lastMessage: {
            content: "Start a conversation...",
            createdAt: new Date(),
          },
        };

        setSelectedConversation(newConversation);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error starting new conversation:", error);
    }
  };

  const loadMessages = async (userId) => {
    setLoading(true);
    try {
      const data = await messagesAPI.getConversation(userId);
      setMessages(data);
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    }
    setLoading(false);
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.user._id);
  };

  const handleUserSelect = (selectedUser) => {
    const existingConv = conversations.find(
      (conv) => conv.user._id === selectedUser._id
    );

    if (existingConv) {
      handleConversationSelect(existingConv);
    } else {
      const newConversation = {
        user: {
          _id: selectedUser._id,
          name: selectedUser.name,
          profilePicture: selectedUser.profilePicture,
          role: selectedUser.role,
        },
        lastMessage: {
          content: "Start a conversation...",
          createdAt: new Date(),
        },
      };

      setSelectedConversation(newConversation);
      setMessages([]);
    }

    setSearchQuery("");
    setSearchResults([]);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const isImage = validImageTypes.includes(file.type);
    const isPDF = file.type === "application/pdf";

    if (!isImage && !isPDF) {
      alert("Please select an image (JPEG, PNG, GIF, WEBP) or PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    e.target.value = "";
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  const uploadFile = async () => {
    if (!selectedFile) return null;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        "http://localhost:5000/api/messages/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "File upload failed");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(`Failed to upload file: ${error.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !selectedConversation) return;

    try {
      let messageData = {
        recipient: selectedConversation.user._id,
        content: newMessage,
        sender: user.id,
        createdAt: new Date(),
      };

      if (selectedFile) {
        const fileUrl = await uploadFile();
        if (!fileUrl) return;

        const isImage = selectedFile.type.startsWith("image/");
        messageData = {
          ...messageData,
          content:
            newMessage.trim() ||
            (isImage ? "Shared an image" : "Shared a file"),
          messageType: isImage ? "image" : "file",
          attachmentUrl: fileUrl,
        };
      }

      socket.emit("sendMessage", messageData);

      await messagesAPI.sendMessage(
        selectedConversation.user._id,
        messageData.content,
        messageData.messageType,
        messageData.attachmentUrl
      );

      setMessages((prev) => [
        ...prev,
        {
          ...messageData,
          sender: {
            _id: user.id,
            name: user.name,
            profilePicture: user.profilePicture,
          },
          recipient: selectedConversation.user,
        },
      ]);

      setNewMessage("");
      setSelectedFile(null);
      loadConversations();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessageContent = (message) => {
    if (message.messageType === "image") {
      return (
        <div className="mt-1">
          <img
            src={message.attachmentUrl}
            alt="Shared image"
            className="max-w-xs rounded-lg shadow-md"
            onError={(e) => {
              e.target.style.display = "none";
              const fallback = document.getElementById(
                `image-fallback-${message._id}`
              );
              if (fallback) fallback.style.display = "block";
            }}
          />
          <div
            id={`image-fallback-${message._id}`}
            className="hidden bg-gray-100 p-4 rounded-lg mt-2"
          >
            <div className="flex items-center">
              <ImageIcon className="text-gray-400 mr-2" size={20} />
              <span className="text-sm text-gray-600">Image not available</span>
            </div>
          </div>
          {message.content && message.content !== "Shared an image" && (
            <p className="text-sm mt-2">{message.content}</p>
          )}
        </div>
      );
    } else if (message.messageType === "file") {
      const fileName = message.attachmentUrl.split("/").pop();
      const isPDF = fileName.toLowerCase().endsWith(".pdf");

      return (
        <div className="mt-1">
          <div
            onClick={() => handleFileDownload(message.attachmentUrl, fileName)}
            className="flex items-center p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center">
              {isPDF ? (
                <FileText className="text-red-500 mr-3" size={24} />
              ) : (
                <FileText className="text-blue-500 mr-3" size={24} />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{fileName}</p>
                <p className="text-xs text-gray-500">
                  {isPDF ? "PDF Document" : "File"}
                </p>
              </div>
            </div>
            <Download className="ml-4 text-gray-500" size={16} />
          </div>
          {message.content && message.content !== "Shared a file" && (
            <p className="text-sm mt-2">{message.content}</p>
          )}
        </div>
      );
    } else {
      return <p className="text-sm">{message.content}</p>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)]">
      <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Messages
            </h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Search users..."
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Search Results */}
            {searchQuery && (
              <div className="border-b border-gray-200">
                <div className="p-3 bg-gray-50">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Search Results
                  </h3>
                </div>

                {searchLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Users className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No users found</p>
                  </div>
                ) : (
                  searchResults.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleUserSelect(user)}
                      className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {user.name}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            {user.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Conversations List */}
            {!searchQuery && (
              <>
                {conversationsLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">
                      Loading conversations...
                    </p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <MessageCircle
                      size={48}
                      className="mx-auto mb-4 text-gray-300"
                    />
                    <p>No conversations yet.</p>
                    <p className="text-sm">
                      Start a conversation by searching above!
                    </p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.user._id}
                      onClick={() => handleConversationSelect(conversation)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.user._id === conversation.user._id
                          ? "bg-blue-50"
                          : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          {conversation.user.profilePicture ? (
                            <img
                              src={conversation.user.profilePicture}
                              alt={conversation.user.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-medium">
                              {conversation.user.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {conversation.user.name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {conversation.lastMessage?.createdAt
                                ? formatTime(conversation.lastMessage.createdAt)
                                : ""}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage?.content ||
                              "No messages yet"}
                          </p>
                          <span className="text-xs text-gray-500">
                            {conversation.user.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    {selectedConversation.user.profilePicture ? (
                      <img
                        src={selectedConversation.user.profilePicture}
                        alt={selectedConversation.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-medium">
                        {selectedConversation.user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {selectedConversation.user.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedConversation.user.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isOwnMessage = message.sender._id === user.id;
                    const showDate =
                      index === 0 ||
                      formatDate(messages[index - 1].createdAt) !==
                        formatDate(message.createdAt);

                    return (
                      <div key={message._id || index}>
                        {showDate && (
                          <div className="text-center text-xs text-gray-500 my-4">
                            {formatDate(message.createdAt)}
                          </div>
                        )}
                        <div
                          className={`flex ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwnMessage
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            {renderMessageContent(message)}
                            <p
                              className={`text-xs mt-1 ${
                                isOwnMessage ? "text-blue-100" : "text-gray-500"
                              }`}
                            >
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* File Preview */}
              {selectedFile && (
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center">
                    {selectedFile.type.startsWith("image/") ? (
                      <ImageIcon className="text-blue-500 mr-2" size={20} />
                    ) : (
                      <FileText className="text-blue-500 mr-2" size={20} />
                    )}
                    <span className="text-sm text-gray-700 truncate max-w-xs">
                      {selectedFile.name}
                    </span>
                  </div>
                  <button
                    onClick={removeSelectedFile}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-gray-200"
              >
                <div className="flex space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*, application/pdf"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Paperclip size={20} />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Type a message..."
                  />
                  <button
                    type="submit"
                    disabled={
                      (!newMessage.trim() && !selectedFile) || uploading
                    }
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle
                  size={64}
                  className="mx-auto mb-4 text-gray-300"
                />
                <p className="text-lg">
                  Select a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
