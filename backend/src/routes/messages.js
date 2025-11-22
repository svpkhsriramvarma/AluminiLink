const express = require('express');
const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with timestamp and random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images and PDFs only
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'), false);
    }
  }
});

/**
 * @route   POST /api/messages/upload
 * @desc    Upload a file
 * @access  Private
 */
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Return the file URL (adjust based on your server configuration)
 const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({ 
      url: fileUrl,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'File upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/messages
 * @desc    Send a message
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const { recipient, content, messageType = 'text', attachmentUrl = '' } = req.body;

    // Validation
    if (!recipient || (!content && !attachmentUrl)) {
      return res.status(400).json({ 
        message: 'Recipient and content or attachment are required' 
      });
    }

    if (!recipient.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: 'Invalid recipient ID format' 
      });
    }

    if (content && content.trim().length === 0 && !attachmentUrl) {
      return res.status(400).json({ 
        message: 'Message content cannot be empty if no attachment' 
      });
    }

    if (content && content.length > 1000) {
      return res.status(400).json({ 
        message: 'Message cannot exceed 1000 characters' 
      });
    }

    if (recipient === req.user.id.toString()) {
      return res.status(400).json({ 
        message: 'Cannot send message to yourself' 
      });
    }

    // Check if recipient exists
    const recipientUser = await User.findById(recipient);
    if (!recipientUser || !recipientUser.isActive) {
      return res.status(404).json({ 
        message: 'Recipient not found' 
      });
    }

    const message = new Message({
      sender: req.user.id,
      recipient,
      content: content ? content.trim() : '',
      messageType,
      attachmentUrl
    });

    await message.save();
    await message.populate('sender', 'name profilePicture role');
    await message.populate('recipient', 'name profilePicture role');

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      });
    }

    res.status(500).json({ 
      message: 'Server error while sending message',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/messages/conversation/:userId
 * @desc    Get conversation between current user and specified user
 * @access  Private
 */
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: 'Invalid user ID format' 
      });
    }

    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ 
        message: 'Invalid pagination parameters' 
      });
    }

    if (userId === req.user.id.toString()) {
      return res.status(400).json({ 
        message: 'Cannot get conversation with yourself' 
      });
    }

    // Check if the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser || !otherUser.isActive) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    const messages = await Message.getConversation(req.user.id, userId, page, limit);

    // Mark messages as read (messages sent to current user)
    await Message.markConversationAsRead(userId, req.user.id);

    res.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/messages/conversations
 * @desc    Get all conversations for current user
 * @access  Private
 */
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Message.getUserConversations(req.user.id);

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching conversations',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/messages/unread-count
 * @desc    Get unread message count for current user
 * @access  Private
 */
router.get('/unread-count', auth, async (req, res) => {
  try {
    const unreadCount = await Message.getUnreadCount(req.user.id);

    res.json({
      unreadCount
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching unread count',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/messages/:id/read
 * @desc    Mark message as read
 * @access  Private
 */
router.put('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: 'Invalid message ID format' 
      });
    }

    const message = await Message.findById(id);

    if (!message || !message.isActive) {
      return res.status(404).json({ 
        message: 'Message not found' 
      });
    }

    // Only recipient can mark message as read
    if (message.recipient.toString() !== req.user.id.toString()) {
      return res.status(403).json({ 
        message: 'Not authorized to mark this message as read' 
      });
    }

    if (!message.read) {
      await message.markAsRead();
    }

    res.json({
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ 
      message: 'Server error while marking message as read',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/messages/conversation/:userId/read
 * @desc    Mark all messages in conversation as read
 * @access  Private
 */
router.put('/conversation/:userId/read', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: 'Invalid user ID format' 
      });
    }

    if (userId === req.user.id.toString()) {
      return res.status(400).json({ 
        message: 'Cannot mark conversation with yourself as read' 
      });
    }

    const result = await Message.markConversationAsRead(userId, req.user.id);

    res.json({
      message: 'Conversation marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark conversation as read error:', error);
    res.status(500).json({ 
      message: 'Server error while marking conversation as read',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/messages/:id
 * @desc    Delete message (soft delete)
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ 
        message: 'Invalid message ID format' 
      });
    }

    const message = await Message.findById(id);

    if (!message || !message.isActive) {
      return res.status(404).json({ 
        message: 'Message not found' 
      });
    }

    // Only sender can delete message
    if (message.sender.toString() !== req.user.id.toString()) {
      return res.status(403).json({ 
        message: 'Not authorized to delete this message' 
      });
    }

    // Soft delete
    message.isActive = false;
    await message.save();

    res.json({
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ 
      message: 'Server error while deleting message',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/messages/search
 * @desc    Search messages by content
 * @access  Private
 */
router.get('/search', auth, async (req, res) => {
  try {
    const { query, userId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        message: 'Search query must be at least 2 characters long' 
      });
    }

    if (page < 1 || limit < 1 || limit > 50) {
      return res.status(400).json({ 
        message: 'Invalid pagination parameters' 
      });
    }

    const skip = (page - 1) * limit;
    
    const searchQuery = {
      $or: [
        { sender: req.user.id },
        { recipient: req.user.id }
      ],
      content: { $regex: query.trim(), $options: 'i' },
      isActive: true
    };

    // If userId is provided, search only in that conversation
    if (userId) {
      if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ 
          message: 'Invalid user ID format' 
        });
      }
      
      searchQuery.$or = [
        { sender: req.user.id, recipient: userId },
        { sender: userId, recipient: req.user.id }
      ];
    }

    const messages = await Message.find(searchQuery)
      .populate('sender', 'name profilePicture')
      .populate('recipient', 'name profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(messages);
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({ 
      message: 'Server error while searching messages',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;

