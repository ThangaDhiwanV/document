import React from 'react';
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
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';
import PendingSignatures from './PendingSignatures';
import DocumentMetrics from './DocumentMetrics';
import { mockDocuments } from '../../data/mockData';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Documents',
      value: mockDocuments.length.toString(),
      icon: FileText,
      color: 'blue',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Pending Signatures',
      value: mockDocuments.filter(doc => doc.status === 'pending_signature').length.toString(),
      icon: PenTool,
      color: 'orange',
      change: '-8%',
      trend: 'down'
    },
    {
      title: 'Signed Documents',
      value: mockDocuments.filter(doc => doc.status === 'signed').length.toString(),
      icon: CheckCircle,
      color: 'green',
      change: '+23%',
      trend: 'up'
    },
    {
      title: 'Due This Week',
      value: '5',
      icon: Clock,
      color: 'red',
      change: '+2',
      trend: 'up'
    }
  ];

  const handleNewDocument = () => {
    navigate('/builder');
  };

  const handleSignDocuments = () => {
    navigate('/signing');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6 fixed top-16 left-16 right-0 z-40">
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
      <div className="flex-1 overflow-y-auto pt-32 px-3">
        <div className="space-y-4 pb-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
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

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <button 
              onClick={handleNewDocument}
              className="flex items-center space-x-3 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">New Document</p>
                <p className="text-sm text-gray-600">Create from template</p>
              </div>
            </button>
            
            <button 
              onClick={handleSignDocuments}
              className="flex items-center space-x-3 p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <PenTool className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Sign Documents</p>
                <p className="text-sm text-gray-600">Review pending items</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/templates')}
              className="flex items-center space-x-3 p-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Templates</p>
                <p className="text-sm text-gray-600">Manage templates</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/documents')}
              className="flex items-center space-x-3 p-2 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">View Documents</p>
                <p className="text-sm text-gray-600">Browse all documents</p>
              </div>
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;