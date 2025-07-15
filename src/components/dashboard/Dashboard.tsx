import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  PenTool, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Users
} from 'lucide-react';
import { dashboardApi, DashboardStats, ActivityItem } from '../../api/dashboard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';
import PendingSignatures from './PendingSignatures';
import DocumentMetrics from './DocumentMetrics';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statsData = await dashboardApi.getStats();
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleNewDocument = () => {
    navigate('/builder');
  };

  const handleSignDocuments = () => {
    navigate('/signing');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadDashboardData} />;
  }

  if (!stats) {
    return <ErrorMessage message="No dashboard data available" onRetry={loadDashboardData} />;
  }

  const statsCards = [
    {
      title: 'Total Documents',
      value: stats.totalDocuments.toString(),
      icon: FileText,
      color: 'blue' as const,
      change: '+12%',
      trend: 'up' as const
    },
    {
      title: 'Pending Signatures',
      value: stats.pendingSignatures.toString(),
      icon: PenTool,
      color: 'orange' as const,
      change: '-8%',
      trend: 'down' as const
    },
    {
      title: 'Signed Documents',
      value: stats.signedDocuments.toString(),
      icon: CheckCircle,
      color: 'green' as const,
      change: '+23%',
      trend: 'up' as const
    },
    {
      title: 'Due This Week',
      value: stats.dueThisWeek.toString(),
      icon: Clock,
      color: 'red' as const,
      change: '+2',
      trend: 'up' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 fixed top-16 left-16 right-0 z-40">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, Dr. Sarah Chen</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Today</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Content with top padding for fixed header */}
      <div className="pt-28 px-6 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <DocumentMetrics />
            <RecentActivity />
          </div>
          <div>
            <PendingSignatures />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;