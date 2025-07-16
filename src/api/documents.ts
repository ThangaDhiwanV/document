import { Document, DocumentStatus, DocumentType } from '../types';
import { config } from '../config/environment';
import { mockDocuments } from '../mock/documents';
import { apiRequest, mockDelay } from './base';

export interface DocumentFilters {
  search?: string;
  status?: DocumentStatus;
  type?: DocumentType;
  assignedTo?: string;
  createdBy?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
  page: number;
  limit: number;
}

export const documentsApi = {
  async getDocuments(
    filters: DocumentFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<DocumentListResponse> {
    if (config.isDevelopment) {
      await mockDelay();
      
      // Always get fresh data from the mock source
      let filteredDocs = [...mockDocuments];
      
      if (filters.search) {
        filteredDocs = filteredDocs.filter(doc =>
          doc.name.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      
      if (filters.status) {
        filteredDocs = filteredDocs.filter(doc => doc.status === filters.status);
      }
      
      if (filters.type) {
        filteredDocs = filteredDocs.filter(doc => doc.type === filters.type);
      }
      
      // Sort by most recent first
      filteredDocs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      const total = filteredDocs.length;
      const startIndex = (page - 1) * limit;
      const paginatedDocs = filteredDocs.slice(startIndex, startIndex + limit);
      
      return {
        documents: paginatedDocs,
        total,
        page,
        limit
      };
    }
    
    return apiRequest<DocumentListResponse>('/documents', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  async getDocumentById(id: string): Promise<Document> {
    if (config.isDevelopment) {
      await mockDelay();
      const document = mockDocuments.find(doc => doc.id === id);
      if (!document) {
        throw new Error('Document not found');
      }
      return document;
    }
    
    return apiRequest<Document>(`/documents/${id}`);
  },

  async createDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
    if (config.isDevelopment) {
      await mockDelay();
      const newDocument: Document = {
        ...document,
        id: `doc-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockDocuments.push(newDocument);
      return newDocument;
    }
    
    return apiRequest<Document>('/documents', {
      method: 'POST',
      body: JSON.stringify(document),
    });
  },

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    if (config.isDevelopment) {
      await mockDelay();
      const index = mockDocuments.findIndex(doc => doc.id === id);
      if (index === -1) {
        throw new Error('Document not found');
      }
      
      mockDocuments[index] = {
        ...mockDocuments[index],
        ...updates,
        updatedAt: new Date()
      };
      
      return mockDocuments[index];
    }
    
    return apiRequest<Document>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteDocument(id: string): Promise<void> {
    if (config.isDevelopment) {
      await mockDelay();
      const index = mockDocuments.findIndex(doc => doc.id === id);
      if (index === -1) {
        throw new Error('Document not found');
      }
      mockDocuments.splice(index, 1);
      return;
    }
    
    return apiRequest<void>(`/documents/${id}`, {
      method: 'DELETE',
    });
  }
};