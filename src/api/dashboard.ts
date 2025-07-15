import { config } from '../config/environment';
import { apiRequest, mockDelay } from './base';

export interface DashboardStats {
  totalDocuments: number;
  pendingSignatures: number;
  signedDocuments: number;
  dueThisWeek: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  user: string;
  action: string;
  target: string;
  timestamp: Date;
  icon: string;
  iconColor: string;
}

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    if (config.isDevelopment) {
      await mockDelay();
      return {
        totalDocuments: 25,
        pendingSignatures: 8,
        signedDocuments: 15,
        dueThisWeek: 5
      };
    }
    
    return apiRequest<DashboardStats>('/dashboard/stats');
  },

  async getRecentActivity(): Promise<ActivityItem[]> {
    if (config.isDevelopment) {
      await mockDelay();
      return [
        {
          id: '1',
          type: 'document_created',
          user: 'Michael Rodriguez',
          action: 'created document',
          target: 'Aspirin HPLC Method Validation',
          timestamp: new Date('2024-01-22T09:00:00Z'),
          icon: 'FileText',
          iconColor: 'text-blue-600 bg-blue-50'
        },
        {
          id: '2',
          type: 'document_signed',
          user: 'Dr. Sarah Chen',
          action: 'signed document',
          target: 'Paracetamol Batch COA-2024-001',
          timestamp: new Date('2024-01-23T14:30:00Z'),
          icon: 'PenTool',
          iconColor: 'text-green-600 bg-green-50'
        }
      ];
    }
    
    return apiRequest<ActivityItem[]>('/dashboard/activity');
  },

  async getDocumentMetrics(): Promise<any> {
    if (config.isDevelopment) {
      await mockDelay();
      return [
        { month: 'Jan', documents: 45, signatures: 38 },
        { month: 'Feb', documents: 52, signatures: 47 },
        { month: 'Mar', documents: 48, signatures: 42 },
        { month: 'Apr', documents: 61, signatures: 55 },
        { month: 'May', documents: 55, signatures: 49 },
        { month: 'Jun', documents: 67, signatures: 62 }
      ];
    }
    
    return apiRequest<any>('/dashboard/metrics');
  }
};