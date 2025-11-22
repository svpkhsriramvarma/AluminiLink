const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    default: ''
  }
});

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  role: {
    type: String,
    required: true,
    trim: true
  },
  questions: [questionSchema],
  userAnswers: [{
    type: Number,
    min: 0,
    max: 3
  }],
  score: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  completedAt: {
    type: Date,
    default: null
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress'
  }
}, {
  timestamps: true
});

// Index for better performance
interviewSchema.index({ user: 1, createdAt: -1 });
interviewSchema.index({ user: 1, score: -1 });

// Method to calculate score
interviewSchema.methods.calculateScore = function() {
  if (this.userAnswers.length !== this.questions.length) {
    return { score: 0, percentage: 0 };
  }

  let correctAnswers = 0;
  for (let i = 0; i < this.questions.length; i++) {
    if (this.userAnswers[i] === this.questions[i].correctAnswer) {
      correctAnswers++;
    }
  }

  const score = correctAnswers;
  const percentage = Math.round((correctAnswers / this.questions.length) * 100);

  this.score = score;
  this.percentage = percentage;

  return { score, percentage };
};

// Static method to get user statistics
interviewSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    {
      $match: { 
        user: new mongoose.Types.ObjectId(userId),
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$user',
        totalInterviews: { $sum: 1 },
        highestScore: { $max: '$score' },
        lowestScore: { $min: '$score' },
        averageScore: { $avg: '$score' },
        highestPercentage: { $max: '$percentage' },
        lowestPercentage: { $min: '$percentage' },
        averagePercentage: { $avg: '$percentage' }
      }
    }
  ]);
};

module.exports = mongoose.model('Interview', interviewSchema);