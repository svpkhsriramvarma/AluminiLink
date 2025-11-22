import React, { useState, useEffect } from 'react';
import { interviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Brain, 
  Clock, 
  Trophy, 
  Target, 
  ChevronRight, 
  CheckCircle, 
  XCircle,
  BarChart3,
  History,
  Play,
  Award
} from 'lucide-react';

const Interview = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('setup'); // setup, interview, results, history, stats
  const [interviewData, setInterviewData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Setup form state
  const [setupForm, setSetupForm] = useState({
    topic: '',
    difficulty: 'Medium',
    role: ''
  });

  useEffect(() => {
    loadStats();
    loadHistory();
  }, []);

  useEffect(() => {
    let interval;
    if (currentView === 'interview' && startTime) {
      interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentView, startTime]);

  const loadStats = async () => {
    try {
      const statsData = await interviewAPI.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const historyData = await interviewAPI.getHistory();
      setHistory(historyData.interviews);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await interviewAPI.generateInterview(
        setupForm.topic,
        setupForm.difficulty,
        setupForm.role
      );

      setInterviewData(response.interview);
      setAnswers(new Array(5).fill(-1));
      setCurrentQuestion(0);
      setStartTime(Date.now());
      setCurrentView('interview');
    } catch (error) {
      console.error('Error generating interview:', error);
      alert('Failed to generate interview. Please try again.');
    }
    setLoading(false);
  };

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < 4) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitInterview = async () => {
    if (answers.includes(-1)) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setLoading(true);
    try {
      const response = await interviewAPI.submitInterview(
        interviewData._id,
        answers,
        timeSpent
      );

      setResults(response.results);
      setCurrentView('results');
      loadStats();
      loadHistory();
    } catch (error) {
      console.error('Error submitting interview:', error);
      alert('Failed to submit interview. Please try again.');
    }
    setLoading(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (percentage) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Setup View
  if (currentView === 'setup') {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl shadow-lg text-white p-6 mb-6">
          <div className="flex items-center space-x-3">
            <Brain size={32} />
            <div>
              <h1 className="text-2xl font-bold">AI Interview Practice</h1>
              <p className="text-purple-100">Prepare for your dream job with AI-generated questions</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Setup Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Start New Interview</h2>
              
              <form onSubmit={handleSetupSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic/Subject
                  </label>
                  <input
                    type="text"
                    value={setupForm.topic}
                    onChange={(e) => setSetupForm(prev => ({ ...prev, topic: e.target.value }))}
                    className="form-input"
                    placeholder="e.g., JavaScript, Data Structures, System Design"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={setupForm.difficulty}
                    onChange={(e) => setSetupForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="form-select"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role/Position
                  </label>
                  <input
                    type="text"
                    value={setupForm.role}
                    onChange={(e) => setSetupForm(prev => ({ ...prev, role: e.target.value }))}
                    className="form-input"
                    placeholder="e.g., Frontend Developer, Software Engineer, Data Analyst"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Play size={20} />
                  )}
                  <span>{loading ? 'Generating Questions...' : 'Start Interview'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Stats & History */}
          <div className="space-y-6">
            {/* Quick Stats */}
            {stats && stats.totalInterviews > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Interviews:</span>
                    <span className="font-medium">{stats.totalInterviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Highest Score:</span>
                    <span className="font-medium text-green-600">{stats.highestScore}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lowest Score:</span>
                    <span className="font-medium text-red-600">{stats.lowestScore}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average:</span>
                    <span className="font-medium">{stats.averageScore}/5</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setCurrentView('history')}
                  className="w-full flex items-center space-x-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <History size={20} className="text-gray-600" />
                  <span>View History</span>
                </button>
                <button
                  onClick={() => setCurrentView('stats')}
                  className="w-full flex items-center space-x-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <BarChart3 size={20} className="text-gray-600" />
                  <span>Detailed Stats</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interview View
  if (currentView === 'interview' && interviewData) {
    const question = interviewData.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / 5) * 100;

    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {interviewData.topic} - {interviewData.difficulty}
              </h1>
              <p className="text-gray-600">{interviewData.role}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock size={20} />
                <span>{formatTime(timeSpent)}</span>
              </div>
              <div className="text-sm text-gray-600">
                Question {currentQuestion + 1} of 5
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  answers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion] === index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion] === index && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="font-medium text-gray-700">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="text-gray-900">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentQuestion === 4 ? (
            <button
              onClick={handleSubmitInterview}
              disabled={loading || answers.includes(-1)}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <CheckCircle size={16} />
              )}
              <span>{loading ? 'Submitting...' : 'Submit Interview'}</span>
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              disabled={answers[currentQuestion] === -1}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Results View
  if (currentView === 'results' && results) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Results Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center">
            <div className="mb-4">
              <Trophy size={48} className={`mx-auto ${getScoreColor(results.percentage)}`} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Interview Complete!</h1>
            <div className="flex items-center justify-center space-x-6 text-lg">
              <div>
                <span className="text-gray-600">Score: </span>
                <span className={`font-bold ${getScoreColor(results.percentage)}`}>
                  {results.score}/{results.totalQuestions}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Percentage: </span>
                <span className={`font-bold ${getScoreColor(results.percentage)}`}>
                  {results.percentage}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">Time: </span>
                <span className="font-bold">{formatTime(results.timeSpent)}</span>
              </div>
            </div>
            <div className="mt-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreBadge(results.percentage)}`}>
                {results.percentage >= 80 ? 'Excellent!' : results.percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Detailed Results</h2>
          
          <div className="space-y-6">
            {results.questions.map((q, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start space-x-3 mb-3">
                  {q.isCorrect ? (
                    <CheckCircle size={24} className="text-green-500 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle size={24} className="text-red-500 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Question {index + 1}: {q.question}
                    </h3>
                    
                    <div className="space-y-2 mb-3">
                      {q.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-2 rounded ${
                            optIndex === q.correctAnswer
                              ? 'bg-green-100 text-green-800'
                              : optIndex === q.userAnswer && !q.isCorrect
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-50'
                          }`}
                        >
                          <span className="font-medium">
                            {String.fromCharCode(65 + optIndex)}.
                          </span> {option}
                          {optIndex === q.correctAnswer && (
                            <span className="ml-2 text-green-600 font-medium">(Correct)</span>
                          )}
                          {optIndex === q.userAnswer && optIndex !== q.correctAnswer && (
                            <span className="ml-2 text-red-600 font-medium">(Your Answer)</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-blue-800">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setCurrentView('setup')}
            className="btn-primary"
          >
            Take Another Interview
          </button>
          <button
            onClick={() => setCurrentView('history')}
            className="btn-secondary"
          >
            View History
          </button>
        </div>
      </div>
    );
  }

  // History View
  if (currentView === 'history') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Interview History</h1>
              <button
                onClick={() => setCurrentView('setup')}
                className="btn-primary"
              >
                New Interview
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {history.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <History size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No interview history yet.</p>
                <p className="text-sm">Take your first interview to see results here!</p>
              </div>
            ) : (
              history.map((interview) => (
                <div key={interview._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900">{interview.topic}</h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {interview.difficulty}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded ${getScoreBadge(interview.percentage)}`}>
                          {interview.percentage}%
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{interview.role}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Score: {interview.score}/5</span>
                        <span>Time: {formatTime(interview.timeSpent)}</span>
                        <span>{new Date(interview.completedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(interview.percentage)}`}>
                        {interview.score}/5
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Stats View
  if (currentView === 'stats') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-900">Interview Statistics</h1>
            <button
              onClick={() => setCurrentView('setup')}
              className="btn-primary"
            >
              New Interview
            </button>
          </div>

          {stats && stats.totalInterviews > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm text-blue-600">Total Interviews</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.totalInterviews}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm text-green-600">Highest Score</p>
                    <p className="text-2xl font-bold text-green-900">{stats.highestScore}/5</p>
                    <p className="text-xs text-green-600">{stats.highestPercentage}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm text-red-600">Lowest Score</p>
                    <p className="text-2xl font-bold text-red-900">{stats.lowestScore}/5</p>
                    <p className="text-xs text-red-600">{stats.lowestPercentage}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm text-yellow-600">Average Score</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats.averageScore}/5</p>
                    <p className="text-xs text-yellow-600">{stats.averagePercentage}%</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No statistics available yet.</p>
              <p className="text-sm text-gray-400">Complete some interviews to see your stats!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default Interview;