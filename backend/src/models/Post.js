const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Comment author is required']
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    maxlength: [300, 'Comment cannot exceed 300 characters'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Post author is required']
  },
  description: {
    type: String,
    required: [true, 'Post description is required'],
    maxlength: [1000, 'Post description cannot exceed 1000 characters'],
    trim: true
  },
  image: {
    type: String,
    default: '',
    // validate: {
    //   validator: function(v) {
    //     // More flexible validation for various image URLs
    //     return !v || /^https?:\/\/.+(\.(jpg|jpeg|png|gif|webp)|images\?q=|photo|img|image)/i.test(v);
    //   },
    //   message: 'Image must be a valid image URL'
    // }
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Each tag cannot exceed 30 characters']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ likes: 1 });
postSchema.index({ isActive: 1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Method to check if user liked the post
postSchema.methods.isLikedBy = function(userId) {
  return this.likes.some(like => like.toString() === userId.toString());
};

// Method to add like
postSchema.methods.addLike = function(userId) {
  if (!this.isLikedBy(userId)) {
    this.likes.push(userId);
  }
  return this.save();
};

// Method to remove like
postSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => like.toString() !== userId.toString());
  return this.save();
};

// Method to add comment
postSchema.methods.addComment = function(authorId, text) {
  this.comments.push({
    author: authorId,
    text: text,
    createdAt: new Date()
  });
  return this.save();
};

// Method to remove comment
postSchema.methods.removeComment = function(commentId) {
  this.comments = this.comments.filter(comment => comment._id.toString() !== commentId.toString());
  return this.save();
};

// Static method to get posts by following users
postSchema.statics.getPostsByFollowing = async function(userId, followingIds, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const userIds = [...followingIds, userId]; // Include user's own posts
  
  return this.find({ 
    author: { $in: userIds }, 
    isActive: true 
  })
    .populate('author', 'name profilePicture role')
    .populate('comments.author', 'name profilePicture')
    .populate('likes', 'name profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get all posts (public feed)
postSchema.statics.getAllPosts = async function(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ isActive: true })
    .populate('author', 'name profilePicture role')
    .populate('comments.author', 'name profilePicture')
    .populate('likes', 'name profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get posts by user
postSchema.statics.getPostsByUser = async function(userId) {
  return this.find({ 
    author: userId, 
    isActive: true 
  })
    .populate('author', 'name profilePicture role')
    .populate('comments.author', 'name profilePicture')
    .populate('likes', 'name profilePicture')
    .sort({ createdAt: -1 });
};

// Pre-save middleware to extract tags from description
postSchema.pre('save', function(next) {
  if (this.isModified('description')) {
    // Extract hashtags from description
    const hashtags = this.description.match(/#\w+/g);
    if (hashtags) {
      this.tags = hashtags.map(tag => tag.substring(1).toLowerCase());
    }
  }
  next();
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;