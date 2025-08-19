import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, DollarSign, Users, Building2, ChevronDown } from 'lucide-react';

interface SearchAndFilterProps {
  onFiltersChange: (filters: any) => void;
  module: string;
  data: any[];
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ onFiltersChange, module, data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    dateRange: '',
    valueRange: '',
    owner: '',
    source: '',
    priority: '',
    probability: ''
  });

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filters]);

  const applyFilters = () => {
    let filteredData = [...data];

    // Search filter
    if (searchTerm) {
      filteredData = filteredData.filter(item => {
        const searchFields = [
          item.company_name,
          item.poc_name,
          item.name,
          item.subject,
          item.full_name,
          item.email,
          item.unique_code
        ].filter(Boolean);
        
        return searchFields.some(field => 
          field.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Status filter
    if (filters.status) {
      filteredData = filteredData.filter(item => item.status === filters.status);
    }

    // Owner filter
    if (filters.owner) {
      filteredData = filteredData.filter(item => item.owner_id === filters.owner);
    }

    // Value range filter
    if (filters.valueRange) {
      const [min, max] = filters.valueRange.split('-').map(Number);
      filteredData = filteredData.filter(item => {
        const value = item.value || item.estimated_value || 0;
        return value >= min && (max ? value <= max : true);
      });
    }

    // Date range filter
    if (filters.dateRange) {
      const now = new Date();
      let startDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
      }

      filteredData = filteredData.filter(item => {
        const itemDate = new Date(item.created_at || item.scheduled_at);
        return itemDate >= startDate;
      });
    }

    // Probability filter
    if (filters.probability) {
      filteredData = filteredData.filter(item => item.close_probability === filters.probability);
    }

    // Priority filter
    if (filters.priority) {
      filteredData = filteredData.filter(item => item.priority === filters.priority);
    }

    onFiltersChange(filteredData);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: '',
      dateRange: '',
      valueRange: '',
      owner: '',
      source: '',
      priority: '',
      probability: ''
    });
  };

  const getStatusOptions = () => {
    switch (module) {
      case 'leads':
        return ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];
      case 'deals':
        return ['open', 'won', 'lost', 'on-hold'];
      case 'activities':
        return ['scheduled', 'completed', 'cancelled', 'no-show'];
      case 'customers':
        return ['active', 'inactive', 'churned', 'prospect'];
      default:
        return [];
    }
  };

  const getUniqueOwners = () => {
    const owners = data
      .map(item => item.users?.full_name || item.owner?.full_name)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return owners;
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center space-x-4">
        {/* Search Input */}
        <div className="flex-1 relative min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={`Search ${module}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
            showFilters || activeFiltersCount > 0
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          } text-sm sm:text-base`}
        >
          <Filter className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="ml-1 sm:ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 ml-1 sm:ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            <X className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Statuses</option>
                {getStatusOptions().map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
              </select>
            </div>

            {/* Value Range Filter (for deals/leads) */}
            {(module === 'deals' || module === 'leads') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value Range</label>
                <select
                  value={filters.valueRange}
                  onChange={(e) => setFilters({ ...filters, valueRange: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Any Value</option>
                  <option value="0-1000">$0 - $1K</option>
                  <option value="1000-5000">$1K - $5K</option>
                  <option value="5000-25000">$5K - $25K</option>
                  <option value="25000-100000">$25K - $100K</option>
                  <option value="100000-">$100K+</option>
                </select>
              </div>
            )}

            {/* Owner Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <select
                value={filters.owner}
                onChange={(e) => setFilters({ ...filters, owner: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Owners</option>
                {getUniqueOwners().map(owner => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            </div>

            {/* Probability Filter (for deals/leads) */}
            {(module === 'deals' || module === 'leads') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Probability</label>
                <select
                  value={filters.probability}
                  onChange={(e) => setFilters({ ...filters, probability: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Any Probability</option>
                  <option value="low">Low (0-33%)</option>
                  <option value="medium">Medium (34-66%)</option>
                  <option value="high">High (67-100%)</option>
                </select>
              </div>
            )}

            {/* Priority Filter (for activities) */}
            {module === 'activities' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Any Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            )}
          </div>

          {/* Quick Filter Buttons */}
          <div className="mt-4 flex flex-wrap gap-1 sm:gap-2">
            <button
              onClick={() => setFilters({ ...filters, status: 'new' })}
              className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
            >
              New {module}
            </button>
            <button
              onClick={() => setFilters({ ...filters, dateRange: 'week' })}
              className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium hover:bg-green-200 transition-colors"
            >
              This Week
            </button>
            {(module === 'deals' || module === 'leads') && (
              <button
                onClick={() => setFilters({ ...filters, probability: 'high' })}
                className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors"
              >
                High Probability
              </button>
            )}
            {module === 'activities' && (
              <button
                onClick={() => setFilters({ ...filters, priority: 'urgent' })}
                className="px-2 sm:px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium hover:bg-red-200 transition-colors"
              >
                Urgent
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};