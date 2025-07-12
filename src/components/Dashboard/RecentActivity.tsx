import React from 'react';
import { Clock, FileText, PenTool, CheckCircle, User } from 'lucide-react';
import { format } from 'date-fns';

const RecentActivity: React.FC = () => {
  const activities = [
    {
      id: '1',
      type: 'document_created',
      user: 'Michael Rodriguez',
      action: 'created document',
      target: 'Aspirin HPLC Method Validation',
      timestamp: new Date('2024-01-22T09:00:00Z'),
      icon: FileText,
      iconColor: 'text-blue-600 bg-blue-50'
    },
    {
      id: '2',
      type: 'document_signed',
      user: 'Dr. Sarah Chen',
      action: 'signed document',
      target: 'Paracetamol Batch COA-2024-001',
      timestamp: new Date('2024-01-23T14:30:00Z'),
      icon: PenTool,
      iconColor: 'text-green-600 bg-green-50'
    },
    {
      id: '3',
      type: 'document_approved',
      user: 'Dr. Emily Watson',
      action: 'approved document',
      target: 'Validation Protocol VP-001',
      timestamp: new Date('2024-01-21T16:45:00Z'),
      icon: CheckCircle,
      iconColor: 'text-emerald-600 bg-emerald-50'
    },
    {
      id: '4',
      type: 'user_assigned',
      user: 'James Thompson',
      action: 'assigned reviewer to',
      target: 'SOP for Sample Preparation',
      timestamp: new Date('2024-01-20T11:20:00Z'),
      icon: User,
      iconColor: 'text-purple-600 bg-purple-50'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${activity.iconColor}`}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.user}</span>{' '}
                {activity.action}{' '}
                <span className="font-medium text-blue-600">{activity.target}</span>
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <p className="text-xs text-gray-500">
                  {format(activity.timestamp, 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;