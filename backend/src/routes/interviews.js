const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const Interview = require('../models/Interview');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize Gemini AI
let genAI;
try {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  GEMINI_API_KEY not found. Interview functionality will be limited.');
  } else {
    genAI = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY 
    });
    console.log('✅ Google Gemini AI initialized for interviews');
  }
} catch (error) {
  console.error('❌ Failed to initialize Google Gemini AI for interviews:', error.message);
}

/**
 * @route   POST /api/interviews/generate
 * @desc    Generate interview questions
 * @access  Private
 */
router.post('/generate', auth, async (req, res) => {
  try {
    const { topic, difficulty, role } = req.body;

    // Validation
    if (!topic || !difficulty || !role) {
      return res.status(400).json({
        message: 'Topic, difficulty, and role are required'
      });
    }

    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({
        message: 'Difficulty must be Easy, Medium, or Hard'
      });
    }

    // Check if Gemini AI is available
    if (!genAI) {
      return res.status(503).json({
        message: 'AI service is currently unavailable. Please check the server configuration.',
        error: 'GEMINI_API_KEY not configured'
      });
    }

    try {
      const prompt = `Generate exactly 5 multiple-choice interview questions for the following:
      
Topic: ${topic}
Difficulty Level: ${difficulty}
Role: ${role}

Requirements:
1. Each question should have exactly 4 options (A, B, C, D)
2. Questions should be relevant to the ${role} role and ${topic} topic
3. Difficulty should match the ${difficulty} level
4. Include a brief explanation for the correct answer
5. Format the response as valid JSON

Expected JSON format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Make sure the correctAnswer is the index (0-3) of the correct option in the options array.`;

      // Generate response using new SDK pattern
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-pro", // Updated to standard model name
        contents: prompt,
        safetySettings: [
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_ONLY_HIGH",
          },
        ],
      });

      // Get text response directly
      const text = response.text;

      // Parse the JSON response
      let questionsData;
      try {
        // Clean the response text to extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          questionsData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No valid JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return res.status(500).json({
          message: 'Failed to generate questions. Please try again.',
          error: 'Invalid AI response format'
        });
      }

      // Validate the generated questions
      if (!questionsData.questions || questionsData.questions.length !== 5) {
        return res.status(500).json({
          message: 'Failed to generate exactly 5 questions. Please try again.',
          error: 'Invalid question count'
        });
      }

      // Create new interview
      const interview = new Interview({
        user: req.user.id,
        topic: topic.trim(),
        difficulty,
        role: role.trim(),
        questions: questionsData.questions.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || ''
        }))
      });

      await interview.save();

      // Return interview without correct answers
      const interviewResponse = {
        _id: interview._id,
        topic: interview.topic,
        difficulty: interview.difficulty,
        role: interview.role,
        questions: interview.questions.map(q => ({
          question: q.question,
          options: q.options
        })),
        status: interview.status,
        createdAt: interview.createdAt
      };

      res.json({
        message: 'Interview questions generated successfully',
        interview: interviewResponse
      });

    } catch (aiError) {
      console.error('Gemini AI error:', aiError);
      return res.status(503).json({
        message: 'AI service is temporarily unavailable. Please try again later.',
        error: 'AI generation failed'
      });
    }

  } catch (error) {
    console.error('Generate interview error:', error);
    res.status(500).json({
      message: 'Server error while generating interview',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/interviews/:id/submit
 * @desc    Submit interview answers
 * @access  Private
 */
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeSpent } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: 'Invalid interview ID format'
      });
    }

    if (!answers || !Array.isArray(answers) || answers.length !== 5) {
      return res.status(400).json({
        message: 'Exactly 5 answers are required'
      });
    }

    // Validate answers are numbers between 0-3
    for (let answer of answers) {
      if (typeof answer !== 'number' || answer < 0 || answer > 3) {
        return res.status(400).json({
          message: 'Each answer must be a number between 0 and 3'
        });
      }
    }

    const interview = await Interview.findById(id);

    if (!interview) {
      return res.status(404).json({
        message: 'Interview not found'
      });
    }

    if (interview.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to submit this interview'
      });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({
        message: 'Interview already completed'
      });
    }

    // Save answers and calculate score
    interview.userAnswers = answers;
    interview.timeSpent = timeSpent || 0;
    interview.completedAt = new Date();
    interview.status = 'completed';

    const { score, percentage } = interview.calculateScore();

    await interview.save();

    // Prepare detailed results
    const results = interview.questions.map((question, index) => ({
      question: question.question,
      options: question.options,
      userAnswer: answers[index],
      correctAnswer: question.correctAnswer,
      isCorrect: answers[index] === question.correctAnswer,
      explanation: question.explanation
    }));

    res.json({
      message: 'Interview submitted successfully',
      results: {
        score,
        percentage,
        totalQuestions: interview.questions.length,
        correctAnswers: score,
        timeSpent: interview.timeSpent,
        questions: results
      }
    });

  } catch (error) {
    console.error('Submit interview error:', error);
    res.status(500).json({
      message: 'Server error while submitting interview',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/interviews/history
 * @desc    Get user's interview history
 * @access  Private
 */
router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const interviews = await Interview.find({
      user: req.user.id,
      status: 'completed'
    })
      .select('topic difficulty role score percentage completedAt timeSpent')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Interview.countDocuments({
      user: req.user.id,
      status: 'completed'
    });

    res.json({
      interviews,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get interview history error:', error);
    res.status(500).json({
      message: 'Server error while fetching interview history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/interviews/stats
 * @desc    Get user's interview statistics
 * @access  Private
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Interview.getUserStats(req.user.id);

    if (stats.length === 0) {
      return res.json({
        totalInterviews: 0,
        highestScore: 0,
        lowestScore: 0,
        averageScore: 0,
        highestPercentage: 0,
        lowestPercentage: 0,
        averagePercentage: 0
      });
    }

    const userStats = stats[0];
    
    res.json({
      totalInterviews: userStats.totalInterviews,
      highestScore: userStats.highestScore,
      lowestScore: userStats.lowestScore,
      averageScore: Math.round(userStats.averageScore * 100) / 100,
      highestPercentage: userStats.highestPercentage,
      lowestPercentage: userStats.lowestPercentage,
      averagePercentage: Math.round(userStats.averagePercentage * 100) / 100
    });

  } catch (error) {
    console.error('Get interview stats error:', error);
    res.status(500).json({
      message: 'Server error while fetching interview statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/interviews/:id
 * @desc    Get specific interview details
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: 'Invalid interview ID format'
      });
    }

    const interview = await Interview.findById(id);

    if (!interview) {
      return res.status(404).json({
        message: 'Interview not found'
      });
    }

    if (interview.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to view this interview'
      });
    }

    res.json(interview);

  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({
      message: 'Server error while fetching interview',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;