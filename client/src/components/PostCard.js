import React, { useState } from "react";
import { Link } from "react-router-dom";
import { postsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Trash2,
  Calendar,
} from "lucide-react";

const PostCard = ({ post, onUpdate }) => {
  const { user } = useAuth();

  // Safely initialize likes array
  const initialLikes = Array.isArray(post.likes) ? post.likes : [];

  // Safely initialize comments array
  const initialComments = Array.isArray(post.comments) ? post.comments : [];

  const [isLiked, setIsLiked] = useState(
    initialLikes.some(
      (like) =>
        like?._id === user?.id ||
        like === user?.id ||
        (typeof like === "object" && like._id === user?.id)
    )
  );

  const [likesCount, setLikesCount] = useState(initialLikes.length);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(initialComments);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    try {
      const response = await postsAPI.likePost(post._id);
      setIsLiked(response.isLiked);
      setLikesCount(response.likes.length);
      onUpdate({ ...post, likes: response.likes });
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await postsAPI.addComment(post._id, newComment);
      setComments((prev) => [...prev, response.comment]);
      setNewComment("");
      onUpdate({ ...post, comments: [...comments, response.comment] });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
    setLoading(false);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await postsAPI.deleteComment(post._id, commentId);
      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId)
      );
      onUpdate({
        ...post,
        comments: comments.filter((c) => c._id !== commentId),
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Safely get author ID
  const authorId = post.author?._id || post.author || "";

  return (
    <div className="p-6">
      {/* Post Header */}
      <div className="flex items-start space-x-3 mb-4">
        <Link to={`/user/${authorId}`}>
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            {post.author?.profilePicture ? (
              <img
                src={post.author.profilePicture}
                alt={post.author?.name || "User"}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-medium">
                {post.author?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to={`/user/${authorId}`}
                className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
              >
                {post.author?.name || "Unknown User"}
              </Link>
              {post.author?.role && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {post.author.role}
                </span>
              )}
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Calendar size={14} className="mr-1" />
                {formatDate(post.createdAt)}
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-800 leading-relaxed mb-3">{post.description}</p>
        {post.image && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={post.image}
              alt="Post content"
              className="w-full h-auto object-cover"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between py-2 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-colors ${
              isLiked ? "text-red-600" : "text-gray-600 hover:text-red-600"
            }`}
          >
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
            <span className="text-sm font-medium">{likesCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <MessageCircle size={20} />
            <span className="text-sm font-medium">{comments.length}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {/* Add Comment */}
          <form onSubmit={handleComment} className="mb-4">
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || loading}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment._id} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  {comment.author?.profilePicture ? (
                    <img
                      src={comment.author.profilePicture}
                      alt={comment.author?.name || "User"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 text-sm font-medium">
                      {comment.author?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-900">
                        {comment.author?.name || "Unknown User"}
                      </span>
                      {comment.author?._id === user?.id && (
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-800 text-sm mt-1">{comment.text}</p>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 ml-3">
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
