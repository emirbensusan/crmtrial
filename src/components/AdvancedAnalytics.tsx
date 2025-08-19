import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Calendar, DollarSign, Users, Target, Clock, AlertTriangle } from 'lucide-react';

interface AdvancedAnalyticsProps {
  leads: any[];
  customers: any[];
  deals: any[];
  activities: any[];
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ leads, customers, deals, activities }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [analytics, setAnalytics] = useState({
    conversionFunnel: [],
    revenueGrowth: [],
    customerSegments: [],
    salesVelocity: 0,
    churnRate: 0,
    ltv: 0,
    cac: 0
  });

  useEffect(() => {
    calculateAdvancedMetrics();
  }, [leads, customers, deals, activities, timeRange]);

  const calculateAdvancedMetrics = () => {
    // Conversion Funnel Analysis
    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter(l => ['qualified', 'proposal', 'negotiation'].includes(l.status)).length;
    const wonDeals = deals.filter(d => d.status === 'won').length;
    
    const conversionFunnel = [
      { stage: 'Potansiyel', count: totalLeads, percentage: 100 },
      { stage: 'Nitelikli', count: qualifiedLeads, percentage: totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0 },
      { stage: 'Kazanılan', count: wonDeals, percentage: totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0 }
    ];

    // Revenue Growth (simulated monthly data)
    const revenueGrowth = [
      { month: 'Oca', revenue: 85000, growth: 12 },
      { month: 'Şub', revenue: 92000, growth: 8.2 },
      { month: 'Mar', revenue: 105000, growth: 14.1 },
      { month: 'Nis', revenue: 98000, growth: -6.7 },
      { month: 'May', revenue: 115000, growth: 17.3 },
      { month: 'Haz', revenue: 128000, growth: 11.3 }
    ];

    // Customer Segments
    const customerSegments = [
      { segment: 'Kurumsal', count: Math.floor(customers.length * 0.3), value: 450000, color: 'bg-blue-500' },
      { segment: 'KOBİ', count: Math.floor(customers.length * 0.5), value: 280000, color: 'bg-green-500' },
      { segment: 'Startup', count: Math.floor(customers.length * 0.2), value: 120000, color: 'bg-purple-500' }
    ];

    // Sales Velocity (days to close)
    const salesVelocity = 28; // Average days

    // Churn Rate (simulated)
    const churnRate = 5.2; // Percentage

    // Customer Lifetime Value
    const ltv = 85000; // Average LTV

    // Customer Acquisition Cost
    const cac = 2500; // Average CAC

    setAnalytics({
      conversionFunnel,
      revenueGrowth,
      customerSegments,
      salesVelocity,
      churnRate,
      ltv,
      cac
    });
  };

  const formatCurrency = (amount: number) => `₺${amount.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gelişmiş Analitik</h2>
        <div className="flex items-center space-x-2">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? '7 Gün' : range === '30d' ? '30 Gün' : range === '90d' ? '90 Gün' : '1 Yıl'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satış Hızı</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.salesVelocity} gün</p>
              <div className="flex items-center mt-1">
                <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">-3 gün (geçen aya göre)</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Churn Oranı</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.churnRate}%</p>
              <div className="flex items-center mt-1">
                <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">-1.2% (geçen aya göre)</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Müşteri LTV</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.ltv)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+12% (geçen aya göre)</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CAC</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.cac)}</p>
              <div className="flex items-center mt-1">
                <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">-8% (geçen aya göre)</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Dönüşüm Hunisi
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">Detaylar</button>
          </div>
          <div className="space-y-4">
            {analytics.conversionFunnel.map((stage, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{stage.count}</span>
                    <span className="text-xs text-gray-500 ml-2">({stage.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${stage.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Growth */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Gelir Büyümesi
            </h3>
            <button className="text-sm text-green-600 hover:text-green-700">Rapor Al</button>
          </div>
          <div className="space-y-3">
            {analytics.revenueGrowth.slice(-3).map((month, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">{month.month}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{formatCurrency(month.revenue)}</div>
                  <div className={`text-xs flex items-center ${
                    month.growth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {month.growth >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(month.growth).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-purple-600" />
            Müşteri Segmentleri
          </h3>
          <button className="text-sm text-purple-600 hover:text-purple-700">Analiz Et</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analytics.customerSegments.map((segment, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 ${segment.color} rounded-full mx-auto mb-3 flex items-center justify-center`}>
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">{segment.segment}</h4>
              <p className="text-sm text-gray-600 mb-2">{segment.count} müşteri</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(segment.value)}</p>
              <p className="text-xs text-gray-500">Toplam değer</p>
            </div>
          ))}
        </div>
      </div>

      {/* Predictive Analytics */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-purple-900 flex items-center">
            <div className="w-5 h-5 mr-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            Tahmine Dayalı Analitik
          </h3>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Beta</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <h4 className="font-semibold text-gray-900 mb-2">Gelecek Ay Tahmini</h4>
            <p className="text-2xl font-bold text-purple-600">₺142K</p>
            <p className="text-sm text-gray-600">%87 güven aralığı</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <h4 className="font-semibold text-gray-900 mb-2">Risk Altındaki Müşteriler</h4>
            <p className="text-2xl font-bold text-red-600">3</p>
            <p className="text-sm text-gray-600">Churn riski yüksek</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <h4 className="font-semibold text-gray-900 mb-2">Upsell Fırsatları</h4>
            <p className="text-2xl font-bold text-green-600">7</p>
            <p className="text-sm text-gray-600">Potansiyel ₺85K</p>
          </div>
        </div>
      </div>
    </div>
  );
};