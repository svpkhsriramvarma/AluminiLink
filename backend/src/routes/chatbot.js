const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Initialize Gemini AI
let genAI;
try {
  if (!process.env.GEMINI_API_KEY) {
    console.warn(
      "⚠️  GEMINI_API_KEY not found. Chatbot functionality will be limited."
    );
  } else {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
    console.log("✅ Google Gemini AI initialized successfully");
  }
} catch (error) {
  console.error("❌ Failed to initialize Google Gemini AI:", error.message);
}

/**
 * Clean Gemini response by removing unnecessary formatting
 */
function cleanGeminiResponse(response) {
  try {
    // Remove *** heading *** patterns
    let cleaned = response.replace(/\*{3}(.*?)\*{3}/g, '');
    
    // Remove excessive newlines and trim whitespace
    cleaned = cleaned.replace(/\n\s*\n/g, '\n\n').trim();
    
    // Remove any remaining markdown artifacts
    cleaned = cleaned.replace(/^#+\s*/gm, '');  // Headings
    cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');  // Bold
    cleaned = cleaned.replace(/\*(.*?)\*/g, '$1');  // Italics
    cleaned = cleaned.replace(/```[^]*?```/g, '');  // Code blocks
    
    return cleaned;
  } catch (e) {
    console.error("Error cleaning Gemini response:", e);
    return response; // Return original if cleaning fails
  }
}

/**
 * @route   POST /api/chatbot/chat
 * @desc    Chat with AI assistant
 * @access  Private
 */
router.post("/chat", auth, async (req, res) => {
  try {
    const { message } = req.body;

    // Validation
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        message: "Message cannot exceed 1000 characters",
      });
    }

    // Check if Gemini AI is available
    if (!genAI) {
      return res.status(503).json({
        message:
          "AI service is currently unavailable. Please check the server configuration.",
        error: "GEMINI_API_KEY not configured",
      });
    }

    try {
      // Create a comprehensive prompt with context for student guidance
      const prompt = `You are an AI assistant for AlumniLink, a platform connecting students and alumni. 
Your role is to help students with their academic doubts, career guidance, and provide helpful advice.

User Context:
- User Name: ${req.user.name}
- User Role: ${req.user.role}
- Platform: AlumniLink (Student-Alumni networking platform)

Guidelines for your responses:
1. Be helpful, informative, and encouraging
2. Provide practical, actionable advice
3. Keep responses concise but comprehensive
4. If it's a technical question, provide clear explanations with examples
5. For career advice, offer specific, actionable guidance
6. Encourage networking and connecting with alumni when relevant
7. Be supportive and motivational
8. If you don't know something, be honest and suggest alternative resources
9. DO NOT use markdown formatting like *** or ** in your responses
10. Use plain text only without special formatting
11. Avoid using code blocks or backticks
12. Structure your response naturally using line breaks only

Student Question: "${message.trim()}"

Please provide a helpful response:`;

      // Generate response using new SDK
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
        generationConfig: {
          // Add configuration to minimize formatting
          stopSequences: ["**", "***", "```"],
          temperature: 0.7,
          topP: 0.9,
        }
      });

      // Get text response and clean it
      const rawText = response.text;
      const cleanedText = cleanGeminiResponse(rawText);

      // Log the interaction
      console.log(
        `Chatbot interaction - User: ${req.user.name} (${req.user.role}), Query: "${message}"`
      );
      console.log(`Raw response: ${rawText.substring(0, 100)}...`);
      console.log(`Cleaned response: ${cleanedText.substring(0, 100)}...`);

      res.json({
        message: cleanedText,
        timestamp: new Date(),
        success: true,
      });
    } catch (aiError) {
      console.error("Gemini AI error:", aiError);

      // Handle specific AI errors
      if (aiError.message?.includes("API_KEY")) {
        return res.status(503).json({
          message: "AI service configuration error. Please contact support.",
          error: "Invalid API key",
        });
      } else if (aiError.message?.includes("quota")) {
        return res.status(503).json({
          message:
            "AI service is temporarily unavailable due to high demand. Please try again later.",
          error: "Quota exceeded",
        });
      } else {
        // Try to get a response directly without context
        try {
          const response = await genAI.models.generateContent({
            model: "gemini-pro", // Updated to standard model name
            contents: message.trim(),
          });
          const rawText = response.text;
          const cleanedText = cleanGeminiResponse(rawText);

          return res.json({
            message: cleanedText,
            timestamp: new Date(),
            success: true,
            fallback: true,
          });
        } catch (secondError) {
          console.error("Fallback AI error:", secondError);
          // Provide a fallback response for AI errors
          const fallbackResponse = getFallbackResponse(message, req.user.role);
          return res.json({
            message: fallbackResponse,
            timestamp: new Date(),
            success: true,
            fallback: true,
          });
        }
      }
    }
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({
      message:
        "Server error while processing your request. Please try again later.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

/**
 * @route   GET /api/chatbot/suggestions
 * @desc    Get suggested questions for the chatbot
 * @access  Private
 */
router.get("/suggestions", auth, async (req, res) => {
  try {
    const suggestions = getSuggestedQuestions(req.user.role);

    res.json({
      suggestions,
      userRole: req.user.role,
    });
  } catch (error) {
    console.error("Get suggestions error:", error);
    res.status(500).json({
      message: "Server error while fetching suggestions",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

/**
 * @route   GET /api/chatbot/health
 * @desc    Check chatbot service health
 * @access  Private
 */
router.get("/health", auth, async (req, res) => {
  try {
    const health = {
      status: "OK",
      geminiConfigured: !!genAI,
      timestamp: new Date(),
    };

    if (genAI) {
      try {
        // Test a simple query to check if the service is working
        const response = await genAI.models.generateContent({
          model: "gemini-2.5-pro", // Updated to standard model name
          contents: "Hello",
        });
        health.geminiWorking = !!response.text;
      } catch (testError) {
        health.geminiWorking = false;
        health.geminiError = testError.message;
      }
    }

    res.json(health);
  } catch (error) {
    console.error("Chatbot health check error:", error);
    res.status(500).json({
      message: "Server error during health check",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

/**
 * Get fallback response when AI is unavailable
 */
function getFallbackResponse(message, userRole) {
  const fallbacks = [
    "I'm having trouble connecting to the AI service right now. Please try again later.",
    "I'm currently unavailable. Feel free to ask alumni in our community while I'm getting fixed!",
    "Temporary service disruption. Our team is working on restoring AI capabilities.",
    "I can't process your request at the moment. Please try again in a few minutes.",
  ];

  // Special responses for career-related questions
  if (
    message.toLowerCase().includes("career") ||
    message.toLowerCase().includes("job")
  ) {
    return "I'm currently unable to access career resources. Check our alumni network for professionals in your field!";
  }

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

/**
 * Get suggested questions based on user role
 */
function getSuggestedQuestions(userRole) {
  const baseSuggestions = [
    "How do I prepare for technical interviews?",
    "What career paths are available in my field?",
    "How to build a professional network?",
    "Tips for balancing coursework and projects",
  ];

  const roleSpecific = {
    student: [
      "How to get research opportunities?",
      "What skills are employers looking for?",
      "How to choose between grad school and industry?",
    ],
    alumni: [
      "How to transition to management roles?",
      "Tips for mentoring students effectively",
      "How to stay updated with industry trends?",
    ],
    faculty: [
      "Latest teaching methodologies in tech",
      "Industry-academia collaboration ideas",
      "Research funding opportunities",
    ],
  };

  return [...baseSuggestions, ...(roleSpecific[userRole] || [])];
}

module.exports = router;