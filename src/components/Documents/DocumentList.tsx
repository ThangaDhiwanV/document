import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Download, Eye, Edit, Trash2, CheckCircle, AlertTriangle, X, Users, Calendar, FileType, FileText, Loader2, ArrowUpDown, ArrowUp, ArrowDown, User } from 'lucide-react';
import { mockDocuments, mockUsers, getDocumentTypeDisplayName } from '../../data/mockData';
import { Document, DocumentStatus, DocumentType } from '../../types';
import StatusBadge from './StatusBadge';
import DocumentViewer from './DocumentViewer';
import { format } from 'date-fns';
import { generateDocumentPDF } from '../../utils/pdfGenerator';

const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState<'none' | 'status' | 'type' | 'version' | 'creator' | 'assignee' | 'dueDate'>('none');
  const [filterBy, setFilterBy] = useState('all');
  const [createdDateFilter, setCreatedDateFilter] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [documents, setDocuments] = useState(mockDocuments);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'name' | 'type' | 'status' | 'createdAt' | 'dueDate' | 'version' | 'createdBy' | 'assignedTo'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Get dynamic filter options based on groupBy selection
  const getFilterOptions = () => {
    switch (groupBy) {
      case 'status':
        return [
          { value: 'all', label: 'All Status' },
          { value: 'draft', label: 'Draft' },
          { value: 'under_review', label: 'Under Review' },
          { value: 'approved', label: 'Approved' },
          { value: 'pending_signature', label: 'Pending Signature' },
          { value: 'signed', label: 'Signed' },
          { value: 'rejected', label: 'Rejected' },
          { value: 'archived', label: 'Archived' }
        ];
      case 'type':
        return [
          { value: 'all', label: 'All Types' },
          { value: 'test_method', label: 'Test Method' },
          { value: 'sop', label: 'SOP' },
          { value: 'coa', label: 'COA' },
          { value: 'specification', label: 'Specification' },
          { value: 'protocol', label: 'Protocol' },
          { value: 'report', label: 'Report' }
        ];
      case 'version':
        const versions = [...new Set(documents.map(doc => doc.version))].sort();
        return [
          { value: 'all', label: 'All Versions' },
          ...versions.map(version => ({ value: version, label: `v${version}` }))
        ];
      case 'creator':
        const creators = [...new Set(documents.map(doc => doc.createdBy))];
        return [
          { value: 'all', label: 'All Creators' },
          ...creators.map(creator => {
            const user = mockUsers.find(u => u.id === creator);
            return { value: creator, label: user?.name || 'Unknown User' };
          })
        ];
      case 'assignee':
        const assignees = [...new Set(documents.flatMap(doc => doc.assignedTo).filter(Boolean))];
        return [
          { value: 'all', label: 'All Assignees' },
          { value: 'unassigned', label: 'Unassigned' },
          ...assignees.map(assignee => {
            const user = mockUsers.find(u => u.id === assignee);
            return { value: assignee, label: user?.name || 'Unknown User' };
          })
        ];
      case 'dueDate':
        return [
          { value: 'all', label: 'All Due Dates' },
          { value: 'overdue', label: 'Overdue' },
          { value: 'due_this_week', label: 'Due This Week' },
          { value: 'due_this_month', label: 'Due This Month' }
        ];
      default:
        return [{ value: 'all', label: 'All Documents' }];
    }
  };

  // Filter documents based on search and filters
  const filteredDocuments = documents.filter(document => {
    // Search filter
    if (searchTerm && !document.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Dynamic filter based on groupBy
    if (filterBy !== 'all') {
      switch (groupBy) {
        case 'status':
          if (document.status !== filterBy) return false;
          break;
        case 'type':
          if (document.type !== filterBy) return false;
          break;
        case 'version':
          if (document.version !== filterBy) return false;
          break;
        case 'creator':
          if (document.createdBy !== filterBy) return false;
          break;
        case 'assignee':
          if (filterBy === 'unassigned' && document.assignedTo.length > 0) return false;
          if (filterBy !== 'unassigned' && !document.assignedTo.includes(filterBy)) return false;
          break;
        case 'dueDate':
          const now = new Date();
          const dueDate = document.dueDate ? new Date(document.dueDate) : null;
          if (filterBy === 'overdue' && (!dueDate || dueDate >= now)) return false;
          if (filterBy === 'due_this_week') {
            if (!dueDate) return false;
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            if (dueDate < now || dueDate > weekFromNow) return false;
          }
          if (filterBy === 'due_this_month') {
            if (!dueDate) return false;
            const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
            if (dueDate < now || dueDate > monthFromNow) return false;
          }
          break;
      }
    }

    // Created date filter
    if (createdDateFilter !== 'all') {
      const createdDate = new Date(document.createdAt);
      const now = new Date();
      
      switch (createdDateFilter) {
        case 'today':
          if (createdDate.toDateString() !== now.toDateString()) return false;
          break;
        case 'this_week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (createdDate < weekAgo) return false;
          break;
        case 'this_month':
          if (createdDate.getMonth() !== now.getMonth() || createdDate.getFullYear() !== now.getFullYear()) return false;
          break;
        case 'last_month':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
          const thisMonth = new Date(now.getFullYear(), now.getMonth());
          if (createdDate < lastMonth || createdDate >= thisMonth) return false;
          break;
      }
    }

    return true;
  });

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'dueDate':
        aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        break;
      case 'version':
        aValue = a.version;
        bValue = b.version;
        break;
      case 'createdBy':
        const creatorA = mockUsers.find(u => u.id === a.createdBy);
        const creatorB = mockUsers.find(u => u.id === b.createdBy);
        aValue = creatorA?.name || 'Unknown';
        bValue = creatorB?.name || 'Unknown';
        break;
      case 'assignedTo':
        const assigneeA = a.assignedTo.length > 0 ? mockUsers.find(u => u.id === a.assignedTo[0])?.name || 'Unknown' : 'Unassigned';
        const assigneeB = b.assignedTo.length > 0 ? mockUsers.find(u => u.id === b.assignedTo[0])?.name || 'Unknown' : 'Unassigned';
        aValue = assigneeA;
        bValue = assigneeB;
        break;
      default:
        aValue = a.createdAt;
        bValue = b.createdAt;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Group documents
  const groupedDocuments = () => {
    if (groupBy === 'none') {
      return [{ key: 'all', title: 'All Documents', documents: sortedDocuments }];
    }

    const groups: { [key: string]: Document[] } = {};
    
    sortedDocuments.forEach(document => {
      let groupKey = '';
      
      switch (groupBy) {
        case 'status':
          groupKey = document.status;
          break;
        case 'type':
          groupKey = document.type;
          break;
        case 'version':
          groupKey = document.version;
          break;
        case 'creator':
          const creator = mockUsers.find(u => u.id === document.createdBy);
          groupKey = creator?.name || 'Unknown User';
          break;
        case 'assignee':
          if (document.assignedTo.length === 0) {
            groupKey = 'Unassigned';
          } else {
            const assignee = mockUsers.find(u => u.id === document.assignedTo[0]);
            groupKey = assignee?.name || 'Unknown User';
          }
          break;
        case 'dueDate':
          const dueDate = document.dueDate ? new Date(document.dueDate) : null;
          const now = new Date();
          if (!dueDate) {
            groupKey = 'No Due Date';
          } else if (dueDate < now) {
            groupKey = 'Overdue';
          } else if (dueDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
            groupKey = 'Due This Week';
          } else if (dueDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) {
            groupKey = 'Due This Month';
          } else {
            groupKey = 'Due Later';
          }
          break;
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(document);
    });

    return Object.entries(groups).map(([key, documents]) => ({
      key,
      title: key,
      documents
    }));
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: typeof sortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const handleView = (document: Document) => {
    setSelectedDocument(document);
    setIsViewerOpen(true);
  };

  const handleEdit = (document: Document) => {
    navigate(`/form-builder?documentId=${document.id}`);
  };

  const handleDownload = async (document: Document) => {
    try {
      await generateDocumentPDF(document);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleDelete = async (documentId: string) => {
    setShowDeleteConfirm(documentId);
  };

  const confirmDelete = async (documentId: string) => {
    setShowDeleteConfirm(null);
    const documentToDelete = documents.find(doc => doc.id === documentId);
    const documentName = documentToDelete?.name || 'Unknown Document';

    setDeletingId(documentId);
    
    // Simulate API call
    setTimeout(() => {
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      setDeletingId(null);
      showNotification(`Document "${documentName}" deleted successfully`, 'success');
    }, 1000);
  };

  const handleGroupByChange = (newGroupBy: string) => {
    setGroupBy(newGroupBy as any);
    setFilterBy('all'); // Reset filter when groupBy changes
  };

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case 'test_method':
      case 'protocol':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'sop':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'coa':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'specification':
        return <FileText className="w-4 h-4 text-orange-500" />;
      case 'report':
        return <FileText className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAssignedToDisplay = (assignedTo: string[]) => {
    if (assignedTo.length === 0) return 'Unassigned';
    if (assignedTo.length === 1) {
      const user = mockUsers.find(u => u.id === assignedTo[0]);
      return user?.name || 'Unknown User';
    }
    return `${assignedTo.length} users`;
  };

  return (
    <div className="p-4">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 ${
          notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 hover:bg-white hover:bg-opacity-20 rounded p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-600">Manage your pharmaceutical documents and templates</p>
        </div>
        <button
          onClick={() => navigate('/form-builder')}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Document
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Controls Row: All in Single Line */}
      <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-1">
          {/* Group By */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Group By:</label>
            <select
              value={groupBy}
              onChange={(e) => handleGroupByChange(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
            >
              <option value="none">None</option>
              <option value="status">Status</option>
              <option value="type">Type</option>
              <option value="version">Version</option>
              <option value="creator">Created By</option>
              <option value="assignee">Assigned To</option>
              <option value="dueDate">Due Date</option>
            </select>
          </div>

          {/* Dynamic Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter:</label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]"
            >
              {getFilterOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort By:</label>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as typeof sortField)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
            >
              <option value="name">Name</option>
              <option value="type">Type</option>
              <option value="status">Status</option>
              <option value="createdAt">Created Date</option>
              <option value="dueDate">Due Date</option>
              <option value="version">Version</option>
              <option value="createdBy">Created By</option>
              <option value="assignedTo">Assigned To</option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortDirection === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-600" /> : <ArrowDown className="w-4 h-4 text-blue-600" />}
            </button>
          </div>

          {/* Created Date Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Created:</label>
            <select
              value={createdDateFilter}
              onChange={(e) => setCreatedDateFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[120px]"
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

      {/* Document Groups */}
      <div className="space-y-4">
        {groupedDocuments().map((group) => (
          <div key={group.key} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {groupBy !== 'none' && (
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">
                  {group.title} ({group.documents.length})
                </h3>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      >
                        <span>Document Name</span>
                        {getSortIcon('name')}
                      </button>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('type')}
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      >
                        <span>Type</span>
                        {getSortIcon('type')}
                      </button>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('version')}
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      >
                        <span>Version</span>
                        {getSortIcon('version')}
                      </button>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      >
                        <span>Status</span>
                        {getSortIcon('status')}
                      </button>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('createdBy')}
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      >
                        <span>Created By</span>
                        {getSortIcon('createdBy')}
                      </button>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('assignedTo')}
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      >
                        <span>Assigned To</span>
                        {getSortIcon('assignedTo')}
                      </button>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('createdAt')}
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      >
                        <span>Created Date</span>
                        {getSortIcon('createdAt')}
                      </button>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('dueDate')}
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      >
                        <span>Due Date</span>
                        {getSortIcon('dueDate')}
                      </button>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {group.documents.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {getDocumentIcon(document.type)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {document.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getDocumentTypeDisplayName(document.type)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          v{document.version}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={document.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {mockUsers.find(u => u.id === document.createdBy)?.name || 'Unknown User'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getAssignedToDisplay(document.assignedTo)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {format(new Date(document.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {document.dueDate ? format(new Date(document.dueDate), 'MMM dd, yyyy') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleView(document)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(document)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(document)}
                            className="text-purple-600 hover:text-purple-800 transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(document.id)}
                            disabled={deletingId === document.id}
                            className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === document.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Document</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "{documents.find(d => d.id === showDeleteConfirm)?.name}"?
            </p>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {isViewerOpen && selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          users={mockUsers}
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setSelectedDocument(null);
          }}
        />
      )}
    </div>
  );
};

export default DocumentList;