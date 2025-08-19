import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Target, Users, DollarSign, Calendar, Lightbulb, ArrowRight } from 'lucide-react';

interface AIInsightsPanelProps {
  leads: any[];
  customers: any[];
  deals: any[];
  activities: any[];
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ leads, customers, deals, activities }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateInsights();
  }, [leads, customers, deals, activities]);

  const generateInsights = () => {
    setLoading(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const aiInsights = [
        {
          type: 'opportunity',
          icon: Target,
          title: 'High-Value Lead Identified',
          description: 'TechCorp Inc. shows 85% conversion probability based on engagement patterns',
          action: 'Schedule demo call',
          priority: 'high',
          color: 'text-green-600 bg-green-100'
        },
        {
          type: 'risk',
          icon: TrendingUp,
          title: 'Deal at Risk',
          description: 'Enterprise Software Deal ($50K) - No activity in 14 days',
          action: 'Send follow-up',
          priority: 'urgent',
          color: 'text-red-600 bg-red-100'
        },
        {
          type: 'trend',
          icon: Users,
          title: 'Conversion Rate Trending Up',
          description: 'Lead-to-customer conversion improved by 23% this month',
          action: 'Analyze successful patterns',
          priority: 'medium',
          color: 'text-blue-600 bg-blue-100'
        },
        {
          type: 'recommendation',
          icon: DollarSign,
          title: 'Upsell Opportunity',
          description: 'GlobalTech Ltd ready for premium package upgrade (+$25K ARR)',
          action: 'Prepare proposal',
          priority: 'high',
          color: 'text-purple-600 bg-purple-100'
        },
        {
          type: 'forecast',
          icon: Calendar,
          title: 'Q1 Pipeline Forecast',
          description: 'Projected to close $180K in deals based on current probability scores',
          action: 'Review pipeline',
          priority: 'medium',
          color: 'text-indigo-600 bg-indigo-100'
        }
      ];
      
      setInsights(aiInsights);
      setLoading(false);
    }, 1500);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
            <p className="text-sm text-gray-500">Smart recommendations for your business</p>
          </div>
        </div>
        <button
          onClick={generateInsights}
          className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          ✨ Refresh Insights
        </button>
      </div>
      
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">AI analyzing your data...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div
                  key={index}
                  className={`border-l-4 p-4 rounded-r-lg transition-all hover:shadow-md ${getPriorityColor(insight.priority)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${insight.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          insight.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          insight.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {insight.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                      <button className="flex items-center text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">
                        <Lightbulb className="w-4 h-4 mr-1" />
                        {insight.action}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};