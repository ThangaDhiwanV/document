import React, { useState, useEffect } from 'react';
import { PenTool, Clock, CheckCircle, User, FileText, AlertTriangle, Download, X, Eye, Filter, LayoutGrid, List, Search, SortAsc, SortDesc, Calendar, Users } from 'lucide-react';
import { DocumentStatus, DocumentType } from '../../types';
import { format } from 'date-fns';
import { documentsApi } from '../../api/documents';
import { usersApi } from '../../api/users';
import { dropdownsApi } from '../../api/dropdowns';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import KanbanView from './KanbanView';

const SigningQueue: React.FC = () => {
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [viewingDocument, setViewingDocument] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState('Status');
  const [filterBy, setFilterBy] = useState('All Documents');
  const [sortBy, setSortBy] = useState('Name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [createdFilter, setCreatedFilter] = useState('All Dates');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [documentsResponse, usersResponse] = await Promise.all([
        documentsApi.getDocuments(),
        usersApi.getUsers()
      ]);
      
      setDocuments(documentsResponse.documents || []);
      setUsers(usersResponse || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = (documentId: string) => {
    setSelectedDocument(documentId);
  };

  const handlePreview = (documentId: string) => {
    setViewingDocument(documentId);
  };

  const handleDownload = async (documentId: string) => {
    setDownloadingId(documentId);
    // Simulate download
    setTimeout(() => {
      setDownloadingId(null);
    }, 2000);
  };

  const handleMoveDocument = (documentId: string, newStatus: DocumentStatus, newAssignee?: string, newType?: DocumentType) => {
    // Update document status/assignment
    console.log('Moving document:', documentId, newStatus, newAssignee, newType);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadData} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header and controls */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Signing Queue</h1>
            <p className="text-gray-600">Review and sign pending documents</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban' ? (
          <div className="h-full p-4">
            <KanbanView
              documents={documents}
              users={users}
              groupBy={groupBy.toLowerCase() as 'status' | 'type' | 'assignee'}
              onSign={handleSign}
              onPreview={handlePreview}
              onDownload={handleDownload}
              downloadingId={downloadingId}
              onMoveDocument={handleMoveDocument}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col p-4">
            {/* List view content */}
          </div>
        )}
      </div>
    </div>
  );
};

export default SigningQueue;