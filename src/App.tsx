import React, { useState, useEffect } from 'react';
import { useAuth } from './components/AuthProvider';
import { LoginForm } from './components/LoginForm';
import { LeadForm } from './components/forms/LeadForm';
import { CustomerForm } from './components/forms/CustomerForm';
import { DealForm } from './components/forms/DealForm';
import { ContactForm } from './components/forms/ContactForm';
import { ActivityForm } from './components/forms/ActivityForm';
import { SearchAndFilter } from './components/SearchAndFilter';
import { BulkOperations } from './components/BulkOperations';
import { AIInsightsPanel } from './components/AIInsightsPanel';
import { SmartLeadScoring } from './components/SmartLeadScoring';
import { AdvancedAnalytics } from './components/AdvancedAnalytics';
import { RealtimeNotifications } from './components/RealtimeNotifications';
import { DataExportImport } from './components/DataExportImport';
import { useLeads, useCustomers, useDeals, useActivities, useDashboardStats } from './hooks/useData';
import {
  LayoutDashboard, Users, Building2, UserCheck, Handshake, Calendar,
  Settings, Search, Bell, User, LogOut, Menu, X, Plus, Phone, Video,
  Presentation, Filter, MoreVertical, Edit, Trash2, Eye, ArrowLeft,
  TrendingUp, DollarSign, Clock, Target, AlertCircle, CheckCircle,
  Calendar as CalendarIcon, BarChart3, PieChart, Activity
} from 'lucide-react';

function App() {
  const { user, loading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState('tr');

  // Form states
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showDealForm, setShowDealForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Data hooks
  const { leads, loading: leadsLoading, refetch: refetchLeads } = useLeads();
  const { customers, loading: customersLoading, refetch: refetchCustomers } = useCustomers();
  const { deals, loading: dealsLoading, refetch: refetchDeals } = useDeals();
  const { activities, loading: activitiesLoading, refetch: refetchActivities } = useActivities();
  const { stats, loading: statsLoading } = useDashboardStats();

  // Filtered data
  const [filteredLeads, setFilteredLeads] = useState(leads);
  const [filteredCustomers, setFilteredCustomers] = useState(customers);
  const [filteredDeals, setFilteredDeals] = useState(deals);
  const [filteredActivities, setFilteredActivities] = useState(activities);

  useEffect(() => {
    setFilteredLeads(leads);
    setFilteredCustomers(customers);
    setFilteredDeals(deals);
    setFilteredActivities(activities);
  }, [leads, customers, deals, activities]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const handleFormSave = () => {
    refetchLeads();
    refetchCustomers();
    refetchDeals();
    refetchActivities();
    setEditingItem(null);
  };

  const handleEdit = (item: any, type: string) => {
    setEditingItem(item);
    switch (type) {
      case 'lead':
        setShowLeadForm(true);
        break;
      case 'customer':
        setShowCustomerForm(true);
        break;
      case 'deal':
        setShowDealForm(true);
        break;
      case 'contact':
        setShowContactForm(true);
        break;
      case 'activity':
        setShowActivityForm(true);
        break;
    }
  };

  const handleBulkAction = (action: string, data?: any) => {
    console.log('Bulk action:', action, data);
    if (action === 'import' && data) {
      // Handle import
      console.log('Importing data:', data);
    }
    setSelectedItems([]);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'yeni': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'qualified': 'bg-green-100 text-green-800',
      'nitelikli': 'bg-green-100 text-green-800',
      'active': 'bg-green-100 text-green-800',
      'aktif': 'bg-green-100 text-green-800',
      'open': 'bg-blue-100 text-blue-800',
      'won': 'bg-green-100 text-green-800',
      'completed': 'bg-green-100 text-green-800',
      'scheduled': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number, currency = 'TRY') => {
    const symbols = { USD: '$', EUR: '€', TRY: '₺' };
    return `${symbols[currency] || '₺'}${amount?.toLocaleString() || 0}`;
  };

  const formatDate = (date: string) => {
    if (!date) return 'Tarih yok';
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const navigation = [
    { name: 'Kontrol Paneli', icon: LayoutDashboard, id: 'dashboard' },
    { name: 'Potansiyel Müşteriler', icon: Users, id: 'leads' },
    { name: 'Müşteriler', icon: Building2, id: 'customers' },
    { name: 'Kişiler', icon: UserCheck, id: 'contacts' },
    { name: 'Anlaşmalar', icon: Handshake, id: 'deals' },
    { name: 'Aktiviteler', icon: Calendar, id: 'activities' },
    { name: 'Ayarlar', icon: Settings, id: 'settings' }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <button
            onClick={() => setShowLeadForm(true)}
            className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
          >
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-2 group-hover:bg-blue-700 transition-colors">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900">Potansiyel Ekle</span>
          </button>

          <button
            onClick={() => setShowCustomerForm(true)}
            className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
          >
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-2 group-hover:bg-green-700 transition-colors">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900">Müşteri Ekle</span>
          </button>

          <button
            onClick={() => setShowDealForm(true)}
            className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
          >
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-2 group-hover:bg-purple-700 transition-colors">
              <Handshake className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900">Anlaşma Ekle</span>
          </button>

          <button
            onClick={() => setShowContactForm(true)}
            className="flex flex-col items-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors group"
          >
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-2 group-hover:bg-indigo-700 transition-colors">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900">Kişi Ekle</span>
          </button>

          <button
            onClick={() => { setShowActivityForm(true); setEditingItem({ activity_type: 'call' }); }}
            className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
          >
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-2 group-hover:bg-orange-700 transition-colors">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900">Arama Ekle</span>
          </button>

          <button
            onClick={() => { setShowActivityForm(true); setEditingItem({ activity_type: 'meeting' }); }}
            className="flex flex-col items-center p-4 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors group"
          >
            <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-2 group-hover:bg-teal-700 transition-colors">
              <Video className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900">Toplantı Ekle</span>
          </button>

          <button
            onClick={() => { setShowActivityForm(true); setEditingItem({ activity_type: 'demo' }); }}
            className="flex flex-col items-center p-4 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors group"
          >
            <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-2 group-hover:bg-pink-700 transition-colors">
              <Presentation className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900">Demo Ekle</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Potansiyel</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
              <p className="text-xs text-green-600 mt-1">Bu ay</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Müşteriler</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              <p className="text-xs text-blue-600 mt-1">Aktif hesaplar</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif Anlaşmalar</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeDeals}</p>
              <p className="text-xs text-purple-600 mt-1">Pipeline'da</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Handshake className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gelir</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-xs text-green-600 mt-1">Bu çeyrek</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dönüşüm Oranı</p>
              <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
              <p className="text-xs text-blue-600 mt-1">Potansiyel'den müşteriye</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ort. Anlaşma Büyüklüğü</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgDealSize)}</p>
              <p className="text-xs text-purple-600 mt-1">Son 30 gün</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Sales Cycle Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Satış Döngüsü Analizi
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">Rapor Al</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ortalama Döngü Süresi</span>
              <span className="text-lg font-semibold text-gray-900">28 gün</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Potansiyel → Nitelikli</span>
                <span className="text-gray-900">7 gün</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Nitelikli → Teklif</span>
                <span className="text-gray-900">12 gün</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Teklif → Kapanış</span>
                <span className="text-gray-900">9 gün</span>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600">%15 daha hızlı (geçen aya göre)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-green-600" />
              Gelir Dağılımı
            </h3>
            <button className="text-sm text-green-600 hover:text-green-700">Detaylar</button>
          </div>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">₺1.2M</div>
              <div className="text-sm text-gray-600">Bu Çeyrek Toplam</div>
              <div className="flex items-center justify-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+34%</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Yeni Müşteri</span>
                </div>
                <span className="text-sm font-medium">₺720K</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Yenileme</span>
                </div>
                <span className="text-sm font-medium">₺350K</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Ek Satış</span>
                </div>
                <span className="text-sm font-medium">₺130K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Open Deals Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
              Açık Anlaşmalar
            </h3>
            <button className="text-sm text-purple-600 hover:text-purple-700">Tümünü Gör</button>
          </div>
          <div className="space-y-3">
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-gray-900">₺850K</div>
              <div className="text-sm text-gray-600">Toplam Pipeline Değeri</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">TechCorp Solutions</div>
                  <div className="text-xs text-gray-600">Yüksek olasılık</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">₺75K</div>
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">Global Industries</div>
                  <div className="text-xs text-gray-600">Orta olasılık</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">₺45K</div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full ml-auto"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">Enterprise Corp</div>
                  <div className="text-xs text-gray-600">Düşük olasılık</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">₺25K</div>
                  <div className="w-2 h-2 bg-red-500 rounded-full ml-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Actions & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
              Bekleyen İşlemler
            </h3>
            <button className="text-sm text-red-600 hover:text-red-700">Tümünü Gör</button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                <div>
                  <div className="text-sm font-medium text-red-900">Geciken Takip</div>
                  <div className="text-xs text-red-700">TechCorp - 16 gün önce</div>
                </div>
              </div>
              <button className="text-xs bg-red-600 text-white px-2 py-1 rounded">Acil</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-yellow-600 mr-2" />
                <div>
                  <div className="text-sm font-medium text-yellow-900">Sözleşme Hazır</div>
                  <div className="text-xs text-yellow-700">Global Industries</div>
                </div>
              </div>
              <button className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">Önemli</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 text-blue-600 mr-2" />
                <div>
                  <div className="text-sm font-medium text-blue-900">Toplantı Planla</div>
                  <div className="text-xs text-blue-700">Enterprise Corp</div>
                </div>
              </div>
              <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Planlandı</button>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-indigo-600" />
              Aylık Performans
            </h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-700">Rapor Al</button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">24</div>
              <div className="text-xs text-gray-600">Yeni Potansiyel</div>
              <div className="flex items-center justify-center mt-1">
                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600">+12%</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">18</div>
              <div className="text-xs text-gray-600">Nitelikli</div>
              <div className="flex items-center justify-center mt-1">
                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600">+8%</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">6</div>
              <div className="text-xs text-gray-600">Kazanılan</div>
              <div className="flex items-center justify-center mt-1">
                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600">+25%</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Dönüşüm Oranı</span>
              <span className="font-semibold text-gray-900">33.3%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '33.3%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Son Aktiviteler</h3>
            <button 
              onClick={() => setActiveModule('activities')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Tümünü Gör
            </button>
          </div>
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {activity.activity_types?.icon === 'phone' ? (
                    <Phone className={`w-4 h-4 ${activity.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`} />
                  ) : (
                    <Calendar className={`w-4 h-4 ${activity.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.subject}</p>
                  <p className="text-sm text-gray-600">
                    {activity.leads?.company_name || activity.customers?.company_name || 'Şirket yok'}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(activity.created_at)}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                  {activity.status === 'completed' ? 'Tamamlandı' : 
                   activity.status === 'scheduled' ? 'Planlandı' : activity.status}
                </span>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-gray-500 text-center py-4">Son aktivite yok</p>
            )}
          </div>
        </div>

        {/* AI Insights */}
        {activeModule === 'dashboard' ? (
          <AIInsightsPanel 
            leads={leads} 
            customers={customers} 
            deals={deals} 
            activities={activities} 
          />
        ) : (
          <AdvancedAnalytics
            leads={leads}
            customers={customers}
            deals={deals}
            activities={activities}
          />
        )}
      </div>
    </div>
  );

  const renderItemCard = (item: any, type: string) => (
    <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <input
            type="checkbox"
            checked={selectedItems.includes(item.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems([...selectedItems, item.id]);
              } else {
                setSelectedItems(selectedItems.filter(id => id !== item.id));
              }
            }}
            className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {item.company_name || item.name || item.subject || item.full_name || 'İsimsiz'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {type === 'leads' && `${item.poc_name} • ${item.company_country}`}
              {type === 'customers' && `${item.poc_name} • ${formatCurrency(item.lifetime_value || 0)}`}
              {type === 'deals' && `${formatCurrency(item.value)} • ${item.close_probability} olasılık`}
              {type === 'activities' && `${item.leads?.company_name || item.customers?.company_name || 'Şirket yok'}`}
              {type === 'contacts' && `${item.title || 'Pozisyon yok'} • ${item.email || 'E-posta yok'}`}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                {item.status === 'new' ? 'Yeni' :
                 item.status === 'qualified' ? 'Nitelikli' :
                 item.status === 'active' ? 'Aktif' :
                 item.status === 'open' ? 'Açık' :
                 item.status === 'completed' ? 'Tamamlandı' :
                 item.status === 'scheduled' ? 'Planlandı' : item.status}
              </span>
              {item.unique_code && (
                <span className="text-xs text-gray-500">{item.unique_code}</span>
              )}
              {type === 'leads' && item.lead_score && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                  Skor: {item.lead_score}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <button
            onClick={() => handleEdit(item, type.slice(0, -1))}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Düzenle"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
            title="Görüntüle"
          >
            <Eye className="w-4 h-4" />
          </button>
          {type === 'leads' && item.status === 'qualified' && (
            <button
              className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
              title="Dönüştür"
            >
              <Target className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      {type === 'activities' && item.scheduled_at && (
        <div className="mt-2 text-xs text-gray-500">
          📅 {formatDate(item.scheduled_at)}
        </div>
      )}
    </div>
  );

  const renderModuleContent = () => {
    const moduleConfig = {
      leads: { data: filteredLeads, loading: leadsLoading, emptyText: 'Henüz potansiyel müşteri yok', emptySubtext: 'Sisteme ilk potansiyel müşterinizi ekleyerek başlayın.', addText: 'İlk Potansiyeli Ekle', addAction: () => setShowLeadForm(true) },
      customers: { data: filteredCustomers, loading: customersLoading, emptyText: 'Henüz müşteri yok', emptySubtext: 'Sisteme ilk müşterinizi ekleyerek başlayın.', addText: 'İlk Müşteriyi Ekle', addAction: () => setShowCustomerForm(true) },
      deals: { data: filteredDeals, loading: dealsLoading, emptyText: 'Henüz anlaşma yok', emptySubtext: 'Satış fırsatlarını takip etmek için ilk anlaşmanızı oluşturun.', addText: 'İlk Anlaşmayı Ekle', addAction: () => setShowDealForm(true) },
      activities: { data: filteredActivities, loading: activitiesLoading, emptyText: 'Henüz aktivite yok', emptySubtext: 'İlk aktivitenizi ekleyerek başlayın.', addText: 'İlk Aktiviteyi Ekle', addAction: () => setShowActivityForm(true) },
      contacts: { data: [], loading: false, emptyText: 'Henüz kişi yok', emptySubtext: 'Tüm iş kişilerinizi detaylı ilişki takibi ile yönetin.', addText: 'Yeni Ekle', addAction: () => setShowContactForm(true) }
    };

    const config = moduleConfig[activeModule];
    if (!config) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Bu modül geliştirilme aşamasında</h3>
          <p className="text-gray-600">Bu modül tam CRUD işlemleri, filtreleme ve toplu işlemlerle uygulanacaktır.</p>
        </div>
      );
    }

    if (config.loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Yükleniyor...</span>
          </div>
        </div>
      );
    }

    if (config.data.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeModule === 'leads' && <Users className="w-8 h-8 text-gray-400" />}
            {activeModule === 'customers' && <Building2 className="w-8 h-8 text-gray-400" />}
            {activeModule === 'deals' && <Handshake className="w-8 h-8 text-gray-400" />}
            {activeModule === 'activities' && <Calendar className="w-8 h-8 text-gray-400" />}
            {activeModule === 'contacts' && <UserCheck className="w-8 h-8 text-gray-400" />}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{config.emptyText}</h3>
          <p className="text-gray-600 mb-6">{config.emptySubtext}</p>
          <button
            onClick={config.addAction}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {config.addText}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {config.data.map(item => renderItemCard(item, activeModule))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">MDJS CRM</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveModule(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeModule === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {activeModule !== 'dashboard' && (
                <button
                  onClick={() => setActiveModule('dashboard')}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  title="Kontrol Paneline Dön"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Her şeyi ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <RealtimeNotifications />
              </div>

              <div className="relative">
                <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900">
                  <span className="text-lg">🇹🇷</span>
                  <span className="text-sm font-medium">TR</span>
                </button>
              </div>

              <div className="relative">
                <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900">
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">{user.user_metadata?.full_name || user.email}</span>
                </button>
              </div>

              <button
                onClick={signOut}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Çıkış Yap"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          {activeModule === 'dashboard' ? renderDashboard() : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                  {navigation.find(nav => nav.id === activeModule)?.name}
                </h1>
                <button
                  onClick={() => {
                    if (activeModule === 'leads') setShowLeadForm(true);
                    else if (activeModule === 'customers') setShowCustomerForm(true);
                    else if (activeModule === 'deals') setShowDealForm(true);
                    else if (activeModule === 'contacts') setShowContactForm(true);
                    else if (activeModule === 'activities') setShowActivityForm(true);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Ekle
                </button>
              </div>

              <SearchAndFilter
                onFiltersChange={(filtered) => {
                  if (activeModule === 'leads') setFilteredLeads(filtered);
                  else if (activeModule === 'customers') setFilteredCustomers(filtered);
                  else if (activeModule === 'deals') setFilteredDeals(filtered);
                  else if (activeModule === 'activities') setFilteredActivities(filtered);
                }}
                module={activeModule}
                data={activeModule === 'leads' ? leads : 
                      activeModule === 'customers' ? customers :
                      activeModule === 'deals' ? deals :
                      activeModule === 'activities' ? activities : []}
              />

              <BulkOperations
                module={activeModule}
                selectedItems={selectedItems}
                onBulkAction={handleBulkAction}
                onClearSelection={() => setSelectedItems([])}
              />

              {renderModuleContent()}
            </div>
          )}
        </main>
      </div>

      {/* Forms */}
      <LeadForm
        lead={editingItem}
        isOpen={showLeadForm}
        onClose={() => { setShowLeadForm(false); setEditingItem(null); }}
        onSave={handleFormSave}
      />

      <CustomerForm
        customer={editingItem}
        isOpen={showCustomerForm}
        onClose={() => { setShowCustomerForm(false); setEditingItem(null); }}
        onSave={handleFormSave}
      />

      <DealForm
        deal={editingItem}
        isOpen={showDealForm}
        onClose={() => { setShowDealForm(false); setEditingItem(null); }}
        onSave={handleFormSave}
      />

      <ContactForm
        contact={editingItem}
        isOpen={showContactForm}
        onClose={() => { setShowContactForm(false); setEditingItem(null); }}
        onSave={handleFormSave}
      />

      <ActivityForm
        activity={editingItem}
        isOpen={showActivityForm}
        onClose={() => { setShowActivityForm(false); setEditingItem(null); }}
        onSave={handleFormSave}
      />
    </div>
  );
}

export default App;