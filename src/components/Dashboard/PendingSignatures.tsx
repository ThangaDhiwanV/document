import React from 'react';
import { Clock, AlertTriangle, User } from 'lucide-react';
import { mockDocuments, mockUsers } from '../../data/mockData';
import { format } from 'date-fns';

const PendingSignatures: React.FC = () => {
  const pendingDocs = mockDocuments.filter(doc => doc.status === 'pending_signature');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Pending Signatures</h3>
        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {pendingDocs.length} pending
        </span>
      </div>
      
      <div className="space-y-4">
        {pendingDocs.map((doc) => {
          const assignedUser = mockUsers.find(user => doc.assignedTo.includes(user.id));
          const isUrgent = doc.dueDate && new Date(doc.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
          
          return (
            <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {doc.name}
                    </h4>
                    {isUrgent && (
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{assignedUser?.name || 'Unassigned'}</span>
                    </div>
                    {doc.dueDate && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Due {format(new Date(doc.dueDate), 'MMM d')}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <button className="text-xs bg-orange-50 text-orange-700 px-3 py-1 rounded-md hover:bg-orange-100 transition-colors">
                  Sign Now
                </button>
              </div>
            </div>
          );
        })}
        
        {pendingDocs.length === 0 && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No pending signatures</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingSignatures;