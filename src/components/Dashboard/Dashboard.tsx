import React, { useState } from 'react';
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Calendar,
  Filter,
  Search,
  SortAsc,
  X,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';
import DocumentMetrics from './DocumentMetrics';
import PendingSignatures from './PendingSignatures';

const Dashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [activeFilters, setActiveFilters] = useState(0);

  const stats = [
    {
      title: 'Total Documents',
      value: '2,847',
      change: '+12%',
      trend: 'up' as const,
      icon: FileText,
      color: 'blue'
    },
    {
      title: 'Pending Signatures',
      value: '23',
      change: '-8%',
      trend: 'down' as const,
      icon: Clock,
      color: 'orange'
    },
    {
      title: 'Completed Today',
      value: '156',
      change: '+24%',
      trend: 'up' as const,
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Active Users',
      value: '89',
      change: '+5%',
      trend: 'up' as const,
      icon: Users,
      color: 'purple'
    }
  ];

  const quickActions = [
    { icon: FileText, label: 'New Document', color: 'bg-blue-500' },
    { icon: Users, label: 'Invite User', color: 'bg-green-500' },
    { icon: BarChart3, label: 'View Reports', color: 'bg-purple-500' },
    { icon: Calendar, label: 'Schedule', color: 'bg-orange-500' }
  ];

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setActiveFilters(filter === 'all' ? 0 : 1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFilter('all');
    setSortBy('date');
    setActiveFilters(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Welcome back! Here's what's happening with your documents.
            </p>
          </div>
          
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-64"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="status">Sort by Status</option>
              </select>
              
              {activeFilters > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear ({activeFilters})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="flex flex-col items-center p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className={`${action.color} p-2 sm:p-3 rounded-lg mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Recent Activity */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <RecentActivity />
            <DocumentMetrics />
          </div>
          
          {/* Right Column - Pending Signatures */}
          <div className="space-y-4 sm:space-y-6">
            <PendingSignatures />
            
            {/* Performance Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="text-sm font-semibold text-gray-900">94%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Processing Time</span>
                  <span className="text-sm font-semibold text-gray-900">2.3 days</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '76%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">User Satisfaction</span>
                  <span className="text-sm font-semibold text-gray-900">4.8/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;