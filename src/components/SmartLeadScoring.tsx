import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Star, Target, Zap } from 'lucide-react';

interface SmartLeadScoringProps {
  lead: any;
  onScoreUpdate: (leadId: string, score: number, factors: any[]) => void;
}

export const SmartLeadScoring: React.FC<SmartLeadScoringProps> = ({ lead, onScoreUpdate }) => {
  const [score, setScore] = useState(lead.lead_score || 0);
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateAIScore();
  }, [lead]);

  const calculateAIScore = () => {
    setLoading(true);
    
    // Simulate AI scoring algorithm
    setTimeout(() => {
      const scoringFactors = [
        {
          factor: 'Company Size',
          impact: 'High',
          score: 25,
          reason: 'Enterprise company (500+ employees)',
          color: 'text-green-600'
        },
        {
          factor: 'Engagement Level',
          impact: 'High',
          score: 20,
          reason: 'Multiple touchpoints, responded to emails',
          color: 'text-green-600'
        },
        {
          factor: 'Budget Authority',
          impact: 'Medium',
          score: 15,
          reason: 'Contact is decision maker',
          color: 'text-blue-600'
        },
        {
          factor: 'Industry Match',
          impact: 'Medium',
          score: 10,
          reason: 'Perfect fit for our solution',
          color: 'text-blue-600'
        },
        {
          factor: 'Timeline',
          impact: 'Low',
          score: 5,
          reason: 'Looking to implement in Q2',
          color: 'text-yellow-600'
        }
      ];

      const totalScore = scoringFactors.reduce((sum, factor) => sum + factor.score, 0);
      
      setScore(totalScore);
      setFactors(scoringFactors);
      setLoading(false);
      
      onScoreUpdate(lead.id, totalScore, scoringFactors);
    }, 1000);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Hot Lead';
    if (score >= 60) return 'Warm Lead';
    if (score >= 40) return 'Cold Lead';
    return 'Low Priority';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900">AI Lead Score</h3>
        </div>
        <button
          onClick={calculateAIScore}
          disabled={loading}
          className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
        >
          {loading ? '🤖 Analyzing...' : '✨ Recalculate'}
        </button>
      </div>

      <div className="text-center mb-4">
        <div className={`inline-flex items-center px-4 py-2 rounded-full font-bold text-2xl ${getScoreColor(score)}`}>
          <Star className="w-5 h-5 mr-2" />
          {score}/100
        </div>
        <p className="text-sm font-medium text-gray-600 mt-1">{getScoreLabel(score)}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2"></div>
          <span className="text-sm text-gray-600">AI analyzing lead quality...</span>
        </div>
      ) : (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center">
            <Target className="w-4 h-4 mr-1" />
            Scoring Factors
          </h4>
          {factors.map((factor, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{factor.factor}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${factor.color} bg-opacity-20`}>
                    {factor.impact}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{factor.reason}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-900">+{factor.score}</span>
                <div className="w-12 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(factor.score / 25) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-900">AI Recommendation</span>
        </div>
        <p className="text-sm text-purple-800">
          {score >= 80 ? 'High priority lead! Schedule a demo call within 24 hours.' :
           score >= 60 ? 'Good potential. Send personalized follow-up email.' :
           score >= 40 ? 'Nurture with educational content and check back in 2 weeks.' :
           'Low priority. Add to newsletter list for future nurturing.'}
        </p>
      </div>
    </div>
  );
};