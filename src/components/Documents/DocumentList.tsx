import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Download, Eye, Edit, Trash2, CheckCircle, AlertTriangle, X, Users, Calendar, FileType } from 'lucide-react';
import { mockDocuments, mockUsers, getDocumentTypeDisplayName } from '../../data/mockData';
import { Document, DocumentStatus, DocumentType } from '../../types';
import StatusBadge from './StatusBadge';
import DocumentViewer from './DocumentViewer';
import { format } from 'date-fns';
import { generateDocumentPDF } from '../../utils/pdfGenerator';

const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState<'none' | 'status' | 'type' | 'assignee' | 'creator' | 'version' | 'due_date'>('none');
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'all'>('all');
  const [filterVersion, setFilterVersion] = useState<string>('all');
  const [filterCreatedBy, setFilterCreatedBy] = useState<string>('all');
  const [filterDueDateRange, setFilterDueDateRange] = useState<'all' | 'overdue' | 'due_this_week' | 'due_this_month'>('all');
  const [filterCreatedDateRange, setFilterCreatedDateRange] = useState<'all' | 'today' | 'this_week' | 'this_month' | 'last_month'>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter
    const matchesType = filterType === 'all' || doc.type === filterType;
    
    // Status filter
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    
    // Version filter
    const matchesVersion = filterVersion === 'all' || doc.version === filterVersion;
    
    // Created by filter
    const matchesCreatedBy = filterCreatedBy === 'all' || doc.createdBy === filterCreatedBy;
    
    // Due date filter
    let matchesDueDate = true;
    if (filterDueDateRange !== 'all' && doc.dueDate) {
      const now = new Date();
      const dueDate = new Date(doc.dueDate);
      
      switch (filterDueDateRange) {
        case 'overdue':
          matchesDueDate = dueDate < now;
          break;
        case 'due_this_week':
          const weekFromNow = new Date();
          weekFromNow.setDate(now.getDate() + 7);
          matchesDueDate = dueDate >= now && dueDate <= weekFromNow;
          break;
        case 'due_this_month':
          const monthFromNow = new Date();
          monthFromNow.setMonth(now.getMonth() + 1);
          matchesDueDate = dueDate >= now && dueDate <= monthFromNow;
          break;
      }
    } else if (filterDueDateRange !== 'all' && !doc.dueDate) {
      matchesDueDate = false;
    }
    
    // Created date filter
    let matchesCreatedDate = true;
    const createdDate = new Date(doc.createdAt);
    const now = new Date();
    
    switch (filterCreatedDateRange) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        matchesCreatedDate = createdDate >= today && createdDate < tomorrow;
        break;
      case 'this_week':
        const weekStart = new Date();
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        matchesCreatedDate = createdDate >= weekStart;
        break;
      case 'this_month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        matchesCreatedDate = createdDate >= monthStart;
        break;
      case 'last_month':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        matchesCreatedDate = createdDate >= lastMonthStart && createdDate <= lastMonthEnd;
        break;
      default:
        matchesCreatedDate = true;
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesVersion && 
           matchesCreatedBy && matchesDueDate && matchesCreatedDate;
  });

  // Get unique values for filter dropdowns
  const uniqueVersions = [...new Set(mockDocuments.map(doc => doc.version))].sort();
  const uniqueCreators = [...new Set(mockDocuments.map(doc => doc.createdBy))];

  const getCreatorName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleNewDocument = () => {
    navigate('/builder');
  };

  const handleDownload = async (doc: Document) => {
    setDownloadingId(doc.id);
    
    try {
      await generateDocumentPDF(doc, mockUsers, {
        includeAuditTrail: true,
        includeSignatures: true,
        watermark: doc.status === 'signed' ? 'SIGNED' : doc.status === 'draft' ? 'DRAFT' : undefined
      });
      
      showNotification(`Document "${doc.name}" downloaded successfully!`, 'success');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showNotification('Error downloading document. Please try again.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleView = (doc: Document) => {
    setViewingDocument(doc);
  };

  const handleEdit = (doc: Document) => {
    // In a real app, this would open the document editor
    console.log('Editing document:', doc.id);
    alert(`Opening ${doc.name} for editing...`);
  };

  const handleDelete = (doc: Document) => {
    if (window.confirm(`Are you sure you want to delete "${doc.name}"?`)) {
      setDeletingId(doc.id);
      
      // Simulate API call
      setTimeout(() => {
        // Remove from mockDocuments array
        const index = mockDocuments.findIndex(d => d.id === doc.id);
        if (index > -1) {
          mockDocuments.splice(index, 1);
        }
        setDeletingId(null);
        showNotification(`Document "${doc.name}" deleted successfully!`, 'success');
      }, 1000);
    }
  };

  const groupDocuments = (documents: Document[]) => {
    if (groupBy === 'none') {
      return [{ title: 'All Documents', documents }];
    }

    const groups = new Map<string, Document[]>();
    
    documents.forEach(doc => {
      let groupKey = '';
      switch (groupBy) {
        case 'status':
          groupKey = doc.status.replace('_', ' ').toUpperCase();
          break;
        case 'type':
          groupKey = getDocumentTypeDisplayName(doc.type);
          break;
        case 'assignee':
          if (doc.assignedTo.length === 0) {
            groupKey = 'Unassigned';
          } else {
            groupKey = doc.assignedTo.map(id => getCreatorName(id)).join(', ');
          }
          break;
        case 'creator':
          groupKey = getCreatorName(doc.createdBy);
          break;
        case 'version':
          groupKey = `Version ${doc.version}`;
          break;
        case 'due_date':
          if (!doc.dueDate) {
            groupKey = 'No Due Date';
          } else {
            const dueDate = new Date(doc.dueDate);
            const now = new Date();
            const diffTime = dueDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) {
              groupKey = 'Overdue';
            } else if (diffDays <= 7) {
              groupKey = 'Due This Week';
            } else if (diffDays <= 30) {
              groupKey = 'Due This Month';
            } else {
              groupKey = 'Due Later';
            }
          }
          break;
      }
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(doc);
    });

    return Array.from(groups.entries()).map(([title, documents]) => ({
      title,
      documents: documents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your pharmaceutical documents and templates</p>
        </div>
        <button 
          onClick={handleNewDocument}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>New Document</span>
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 text-sm ${
          notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 hover:bg-white hover:bg-opacity-20 rounded p-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <DocumentViewer
          document={viewingDocument}
          users={mockUsers}
          onClose={() => setViewingDocument(null)}
          onDownload={() => handleDownload(viewingDocument)}
        />
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="space-y-4">
          {/* Search */}
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          
          {/* Group By and Dynamic Filter - Same Line */}
          <div className="flex items-center space-x-4">
            {/* Group By */}
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Group by:</label>
              <select
                value={groupBy}
                onChange={(e) => {
                  const newGroupBy = e.target.value as any;
                  setGroupBy(newGroupBy);
                  // Reset filters when group by changes
                  setFilterType('all');
                  setFilterStatus('all');
                  setFilterVersion('all');
                  setFilterCreatedBy('all');
                  setFilterDueDateRange('all');
                  setFilterCreatedDateRange('all');
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[140px]"
              >
                <option value="none">None</option>
                <option value="status">Status</option>
                <option value="type">Type</option>
                <option value="version">Version</option>
                <option value="assignee">Assignee</option>
                <option value="creator">Creator</option>
                <option value="due_date">Due Date</option>
              </select>
            </div>

            {/* Dynamic Filter based on Group By */}
            {groupBy !== 'none' && (
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by:</label>
                
                {/* Status Filter - when grouped by status */}
                {groupBy === 'status' && (
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[160px]"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="pending_signature">Pending Signature</option>
                    <option value="signed">Signed</option>
                    <option value="rejected">Rejected</option>
                    <option value="archived">Archived</option>
                  </select>
                )}

                {/* Type Filter - when grouped by type */}
                {groupBy === 'type' && (
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[160px]"
                  >
                    <option value="all">All Types</option>
                    <option value="test_method">Test Method</option>
                    <option value="sop">SOP</option>
                    <option value="coa">COA</option>
                    <option value="specification">Specification</option>
                    <option value="protocol">Protocol</option>
                    <option value="report">Report</option>
                  </select>
                )}

                {/* Version Filter - when grouped by version */}
                {groupBy === 'version' && (
                  <select
                    value={filterVersion}
                    onChange={(e) => setFilterVersion(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[160px]"
                  >
                    <option value="all">All Versions</option>
                    {uniqueVersions.map(version => (
                      <option key={version} value={version}>v{version}</option>
                    ))}
                  </select>
                )}

                {/* Creator Filter - when grouped by creator */}
                {groupBy === 'creator' && (
                  <select
                    value={filterCreatedBy}
                    onChange={(e) => setFilterCreatedBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[160px]"
                  >
                    <option value="all">All Creators</option>
                    {uniqueCreators.map(creatorId => {
                      const creator = mockUsers.find(u => u.id === creatorId);
                      return (
                        <option key={creatorId} value={creatorId}>
                          {creator?.name || 'Unknown'}
                        </option>
                      );
                    })}
                  </select>
                )}

                {/* Assignee Filter - when grouped by assignee */}
                {groupBy === 'assignee' && (
                  <select
                    value={filterCreatedBy} // Reusing for assignee filter
                    onChange={(e) => setFilterCreatedBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[160px]"
                  >
                    <option value="all">All Assignees</option>
                    <option value="unassigned">Unassigned</option>
                    {mockUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                )}

                {/* Due Date Filter - when grouped by due date */}
                {groupBy === 'due_date' && (
                  <select
                    value={filterDueDateRange}
                    onChange={(e) => setFilterDueDateRange(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[160px]"
                  >
                    <option value="all">All Due Dates</option>
                    <option value="overdue">Overdue</option>
                    <option value="due_this_week">Due This Week</option>
                    <option value="due_this_month">Due This Month</option>
                  </select>
                )}
              </div>
            )}

            {/* Additional Filters - Always Available */}
            <div className="flex items-center space-x-2 ml-auto">
              <span className="text-sm text-gray-500">Additional:</span>
              
              {/* Created Date Filter */}
              <select
                value={filterCreatedDateRange}
                onChange={(e) => setFilterCreatedDateRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Document Groups */}
      <div className="space-y-4">
        {groupDocuments(filteredDocuments).map((group, groupIndex) => (
          <div key={groupIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {groupBy !== 'none' && (
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">{group.title}</h3>
                <p className="text-xs text-gray-600">{group.documents.length} document{group.documents.length !== 1 ? 's' : ''}</p>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Version
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
            <Users className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700 min-w-0">Group by:</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="none">None</option>
              <option value="status">Status</option>
              <option value="type">Type</option>
              <option value="version">Version</option>
              <option value="assignee">Assignee</option>
              <option value="creator">Creator</option>
              <option value="due_date">Due Date</option>
            </select>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Types</option>
                <option value="test_method">Test Method</option>
                <option value="sop">SOP</option>
                <option value="coa">COA</option>
                <option value="specification">Specification</option>
                <option value="protocol">Protocol</option>
                <option value="report">Report</option>
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="pending_signature">Pending Signature</option>
                <option value="signed">Signed</option>
                <option value="rejected">Rejected</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            {/* Version Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Version</label>
              <select
                value={filterVersion}
                onChange={(e) => setFilterVersion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Versions</option>
                {uniqueVersions.map(version => (
                  <option key={version} value={version}>v{version}</option>
                ))}
              </select>
            </div>
            
            {/* Created By Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Created By</label>
              <select
                value={filterCreatedBy}
                onChange={(e) => setFilterCreatedBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Creators</option>
                {uniqueCreators.map(creatorId => {
                  const creator = mockUsers.find(u => u.id === creatorId);
                  return (
                    <option key={creatorId} value={creatorId}>
                      {creator?.name || 'Unknown'}
                    </option>
                  );
                })}
              </select>
            </div>
            
            {/* Due Date Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
              <select
                value={filterDueDateRange}
                onChange={(e) => setFilterDueDateRange(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Due Dates</option>
                <option value="overdue">Overdue</option>
                <option value="due_this_week">Due This Week</option>
                <option value="due_this_month">Due This Month</option>
              </select>
            </div>
            
            {/* Created Date Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Created Date</label>
              <select
                value={filterCreatedDateRange}
                onChange={(e) => setFilterCreatedDateRange(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Document Groups */}
      <div className="space-y-4">
        {groupDocuments(filteredDocuments).map((group, groupIndex) => (
          <div key={groupIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {groupBy !== 'none' && (
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">{group.title}</h3>
                <p className="text-xs text-gray-600">{group.documents.length} document{group.documents.length !== 1 ? 's' : ''}</p>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Version
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {group.documents.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                              <FileType className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                              {document.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {getDocumentTypeDisplayName(document.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          v{document.version}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={document.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {getCreatorName(document.createdBy)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(document.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {document.dueDate ? format(new Date(document.dueDate), 'MMM d, yyyy') : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleView(document)}
                            className="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded transition-colors"
                            title="View Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(document)}
                            className="text-gray-600 hover:text-gray-900 p-1.5 hover:bg-gray-50 rounded transition-colors"
                            title="Edit Document"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(document)}
                            disabled={downloadingId === document.id}
                            className="text-green-600 hover:text-green-900 p-1.5 hover:bg-green-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={downloadingId === document.id ? "Generating PDF..." : "Download Document"}
                          >
                            <Download className={`w-4 h-4 ${downloadingId === document.id ? 'animate-spin' : ''}`} />
                          </button>
                          <button
                            onClick={() => handleDelete(document)}
                            disabled={deletingId === document.id}
                            className="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={deletingId === document.id ? "Deleting..." : "Delete Document"}
                          >
                            <Trash2 className={`w-4 h-4 ${deletingId === document.id ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {group.documents.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-3">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No documents found</h3>
                <p className="text-sm text-gray-600">
                  {searchTerm || filterBy !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Create your first document to get started.'}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;