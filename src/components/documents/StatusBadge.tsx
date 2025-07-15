import React from 'react';
import { DocumentStatus } from '../../types';

interface StatusBadgeProps {
  status: DocumentStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: DocumentStatus) => {
    switch (status) {
      case 'draft':
        return {
          label: 'Draft',
          classes: 'bg-gray-100 text-gray-800'
        };
      case 'under_review':
        return {
          label: 'Under Review',
          classes: 'bg-yellow-100 text-yellow-800'
        };
      case 'approved':
        return {
          label: 'Approved',
          classes: 'bg-blue-100 text-blue-800'
        };
      case 'pending_signature':
        return {
          label: 'Pending Signature',
          classes: 'bg-orange-100 text-orange-800'
        };
      case 'signed':
        return {
          label: 'Signed',
          classes: 'bg-green-100 text-green-800'
        };
      case 'rejected':
        return {
          label: 'Rejected',
          classes: 'bg-red-100 text-red-800'
        };
      case 'archived':
        return {
          label: 'Archived',
          classes: 'bg-gray-100 text-gray-600'
        };
      default:
        return {
          label: 'Unknown',
          classes: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;