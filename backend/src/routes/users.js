const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/users/search
 * @desc    Search users by name and role
 * @access  Private
 */
router.get('/search', auth, async (req, res) => {
  try {
    const { query, role } = req.query;
    
    if (!query || query.trim().length < 1) {
      return res.status(400).json({ 
        message: 'Search query must be at least 1 character long' 
      });
    }

    const users = await User.searchUsers(query.trim(), role);
    
    // Filter out current user from results
    const filteredUsers = users.filter(user => 
      user._id.toString() !== req.user.id.toString()
    );

    res.json(filteredUsers);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ 
      message: 'Server error while searching users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;  // ✅ Declare only once

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Fetch user
    const user = await User.findById(id)
      .select('-password')
      .populate('followers', 'name profilePicture role')
      .populate('following', 'name profilePicture role');

    if (!user || !user.isActive) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      message: 'Server error while fetching user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', auth, async (req, res) => {
  try {
    const { 
      name, 
      bio, 
      skills, 
      graduationYear, 
      currentPosition, 
      company, 
      profilePicture 
    } = req.body;

    // Validation
    if (name && name.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Name cannot be empty' 
      });
    }

    if (bio && bio.length > 500) {
      return res.status(400).json({ 
        message: 'Bio cannot exceed 500 characters' 
      });
    }

    if (skills && !Array.isArray(skills)) {
      return res.status(400).json({ 
        message: 'Skills must be an array' 
      });
    }

    if (graduationYear && (graduationYear < 1950 || graduationYear > new Date().getFullYear() + 10)) {
      return res.status(400).json({ 
        message: 'Invalid graduation year' 
      });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (skills !== undefined) updateData.skills = skills.filter(skill => skill.trim()).slice(0, 20); // Limit to 20 skills
    if (graduationYear !== undefined) updateData.graduationYear = graduationYear;
    if (currentPosition !== undefined) updateData.currentPosition = currentPosition.trim();
    if (company !== undefined) updateData.company = company.trim();
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture.trim();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }

    res.status(500).json({ 
      message: 'Server error while updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/users/:id/follow
 * @desc    Follow/Unfollow user
 * @access  Private
 */
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: 'Invalid user ID format' 
      });
    }

    if (id === req.user.id.toString()) {
      return res.status(400).json({ 
        message: 'You cannot follow yourself' 
      });
    }

    const targetUser = await User.findById(id);
    const currentUser = await User.findById(req.user.id);

    if (!targetUser || !targetUser.isActive) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        followId => followId.toString() !== id
      );
      targetUser.followers = targetUser.followers.filter(
        followerId => followerId.toString() !== req.user.id.toString()
      );
    } else {
      // Follow
      currentUser.following.push(id);
      targetUser.followers.push(req.user.id);
    }

    await Promise.all([
      currentUser.save(),
      targetUser.save()
    ]);

    res.json({ 
      message: isFollowing ? 'User unfollowed successfully' : 'User followed successfully',
      isFollowing: !isFollowing,
      followerCount: targetUser.followers.length,
      followingCount: currentUser.following.length
    });
  } catch (error) {
    console.error('Follow/unfollow error:', error);
    res.status(500).json({ 
      message: 'Server error while following/unfollowing user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/users/:id/followers
 * @desc    Get user's followers
 * @access  Private
 */
router.get('/:id/followers', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: 'Invalid user ID format' 
      });
    }

    const user = await User.findById(id)
      .populate('followers', 'name profilePicture role createdAt')
      .select('followers');

    if (!user || !user.isActive) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.json(user.followers);
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching followers',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/users/:id/following
 * @desc    Get user's following
 * @access  Private
 */
router.get('/:id/following', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: 'Invalid user ID format' 
      });
    }

    const user = await User.findById(id)
      .populate('following', 'name profilePicture role createdAt')
      .select('following');

    if (!user || !user.isActive) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.json(user.following);
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching following',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/users/suggestions
 * @desc    Get user suggestions (people to follow)
 * @access  Private
 */
router.get('/suggestions', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select('following role');
    const followingIds = currentUser.following.map(id => id.toString());
    
    // Find users with same role or complementary role (Students <-> Alumni)
    const targetRole = currentUser.role === 'Student' ? 'Alumni' : 'Student';
    
    const suggestions = await User.find({
      _id: { 
        $nin: [...followingIds, req.user.id] // Exclude already following and self
      },
      isActive: true,
      $or: [
        { role: targetRole },
        { role: currentUser.role }
      ]
    })
      .select('name profilePicture role bio skills followerCount')
      .limit(10)
      .sort({ createdAt: -1 });

    res.json(suggestions);
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;