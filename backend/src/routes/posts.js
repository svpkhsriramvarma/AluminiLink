const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { description, image } = req.body;

    // Validation
    if (!description || description.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Post description is required' 
      });
    }

    if (description.length > 1000) {
      return res.status(400).json({ 
        message: 'Post description cannot exceed 1000 characters' 
      });
    }

    const post = new Post({
      author: req.user.id,
      description: description.trim(),
      image: image ? image.trim() : ''
    });

    await post.save();
    await post.populate('author', 'name profilePicture role');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    
    if (error.name === 'ValidationError') {
      // Handle image validation errors specifically
      if (error.errors?.image) {
        return res.status(400).json({ 
          message: 'Invalid image URL. Must be a valid image URL (jpg, jpeg, png, gif, webp)' 
        });
      }
      
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }

    res.status(500).json({ 
      message: 'Server error while creating post',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/posts
 * @desc    Get all posts (public feed)
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1 || limit < 1 || limit > 50) {
      return res.status(400).json({ 
        message: 'Invalid pagination parameters' 
      });
    }

    // Use the static method correctly
    const posts = await Post.getAllPosts(page, limit);

    res.json(posts);
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching posts',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/posts/feed
 * @desc    Get personalized feed (posts from followed users)
 * @access  Private
 */
router.get('/feed', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (page < 1 || limit < 1 || limit > 50) {
      return res.status(400).json({ 
        message: 'Invalid pagination parameters' 
      });
    }

    const user = await User.findById(req.user.id).select('following');
    const followingIds = user.following;

    // Use the static method correctly
    const posts = await Post.getPostsByFollowing(req.user.id, followingIds, page, limit);

    res.json(posts);
  } catch (error) {
    console.error('Get feed posts error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching feed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// ... rest of the routes remain the same ...

module.exports = router;