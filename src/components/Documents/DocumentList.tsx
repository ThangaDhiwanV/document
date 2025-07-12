import React, { useState, useMemo } from 'react';
import { Search, Filter, Users, Calendar, ChevronDown, ChevronUp, Eye, Edit, Download, Trash2, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';
import { Document, User } from '../../types';
import { mockDocuments, mockUsers } from '../../data/mockData';
import DocumentViewer from './DocumentViewer';
import StatusBadge from './StatusBadge';

const DocumentList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState<string>('none');
  const [filterValue, setFilterValue] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [createdDateFilter, setCreatedDateFilter] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Get user name by ID
  const getUserName = (userId: string): string => {
    const user = mockUsers.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  // Get assignee names
  const getAssigneeNames = (assigneeIds: string[]): string => {
    if (!assigneeIds || assigneeIds.length === 0) return 'Unassigned';
    const names = assigneeIds.map(id => getUserName(id));
    return names.join(', ');
  };

  // Get dynamic filter options based on groupBy
  const getFilterOptions = () => {
    switch (groupBy) {
      case 'status':
        return [
          { value: 'all', label: 'All Status' },
          { value: 'draft', label: 'Draft' },
          { value: 'under-review', label: 'Under Review' },
          { value: 'approved', label: 'Approved' },
          { value: 'pending-signature', label: 'Pending Signature' },
          { value: 'signed', label: 'Signed' },
          { value: 'rejected', label: 'Rejected' },
          { value: 'archived', label: 'Archived' }
        ];
      case 'type':
        return [
          { value: 'all', label: 'All Types' },
          { value: 'test-method', label: 'Test Method' },
          { value: 'sop', label: 'SOP' },
          { value: 'coa', label: 'COA' },
          { value: 'specification', label: 'Specification' },
          { value: 'protocol', label: 'Protocol' },
          { value: 'report', label: 'Report' }
        ];
      case 'version':
        const versions = [...new Set(mockDocuments.map(doc => doc.version))];
        return [
          { value: 'all', label: 'All Versions' },
          ...versions.map(version => ({ value: version, label: version }))
        ];
      case 'createdBy':
        return [
          { value: 'all', label: 'All Creators' },
          ...mockUsers.map(user => ({ value: user.id, label: user.name }))
        ];
      case 'assignedTo':
        return [
          { value: 'all', label: 'All Assignees' },
          { value: 'unassigned', label: 'Unassigned' },
          ...mockUsers.map(user => ({ value: user.id, label: user.name }))
        ];
      case 'dueDate':
        return [
          { value: 'all', label: 'All Due Dates' },
          { value: 'overdue', label: 'Overdue' },
          { value: 'due-this-week', label: 'Due This Week' },
          { value: 'due-this-month', label: 'Due This Month' }
        ];
      default:
        return [
          { value: 'all', label: 'All Documents' },
          { value: 'draft', label: 'Draft' },
          { value: 'under-review', label: 'Under Review' },
          { value: 'approved', label: 'Approved' },
          { value: 'pending-signature', label: 'Pending Signature' },
          { value: 'signed', label: 'Signed' }
        ];
    }
  };

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = mockDocuments.filter(doc => {
      // Search filter
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           getUserName(doc.createdBy).toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Group-based filter
      if (filterValue !== 'all') {
        switch (groupBy) {
          case 'status':
            if (doc.status.toLowerCase().replace(' ', '-') !== filterValue) return false;
            break;
          case 'type':
            if (doc.type.toLowerCase().replace(' ', '-') !== filterValue) return false;
            break;
          case 'version':
            if (doc.version !== filterValue) return false;
            break;
          case 'createdBy':
            if (doc.createdBy !== filterValue) return false;
            break;
          case 'assignedTo':
            if (filterValue === 'unassigned') {
              if (doc.assignedTo && doc.assignedTo.length > 0) return false;
            } else {
              if (!doc.assignedTo || !doc.assignedTo.includes(filterValue)) return false;
            }
            break;
          case 'dueDate':
            const now = new Date();
            const dueDate = doc.dueDate ? new Date(doc.dueDate) : null;
            if (filterValue === 'overdue' && (!dueDate || dueDate >= now)) return false;
            if (filterValue === 'due-this-week' && (!dueDate || dueDate < now || dueDate > new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000))) return false;
            if (filterValue === 'due-this-month' && (!dueDate || dueDate < now || dueDate > new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000))) return false;
            break;
          default:
            if (doc.status.toLowerCase().replace(' ', '-') !== filterValue) return false;
        }
      }

      // Created date filter
      if (createdDateFilter !== 'all') {
        const createdDate = new Date(doc.createdAt);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (createdDateFilter) {
          case 'today':
            if (createdDate < today) return false;
            break;
          case 'this-week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (createdDate < weekAgo) return false;
            break;
          case 'this-month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (createdDate < monthAgo) return false;
            break;
          case 'last-month':
            const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
            const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (createdDate < twoMonthsAgo || createdDate > oneMonthAgo) return false;
            break;
        }
      }

      return true;
    });

    // Sort documents
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'type':
          aValue = a.type.toLowerCase();
          bValue = b.type.toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'createdDate':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
          bValue = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
          break;
        case 'version':
          aValue = a.version;
          bValue = b.version;
          break;
        case 'createdBy':
          aValue = getUserName(a.createdBy).toLowerCase();
          bValue = getUserName(b.createdBy).toLowerCase();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [searchTerm, groupBy, filterValue, sortBy, sortDirection, createdDateFilter]);

  // Group documents
  const groupedDocuments = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Documents': filteredAndSortedDocuments };
    }

    const groups: { [key: string]: Document[] } = {};

    filteredAndSortedDocuments.forEach(doc => {
      let groupKey: string;

      switch (groupBy) {
        case 'status':
          groupKey = doc.status;
          break;
        case 'type':
          groupKey = doc.type;
          break;
        case 'version':
          groupKey = `Version ${doc.version}`;
          break;
        case 'createdBy':
          groupKey = getUserName(doc.createdBy);
          break;
        case 'assignedTo':
          if (!doc.assignedTo || doc.assignedTo.length === 0) {
            groupKey = 'Unassigned';
          } else {
            groupKey = getAssigneeNames(doc.assignedTo);
          }
          break;
        case 'dueDate':
          if (!doc.dueDate) {
            groupKey = 'No Due Date';
          } else {
            const dueDate = new Date(doc.dueDate);
            const now = new Date();
            if (dueDate < now) {
              groupKey = 'Overdue';
            } else if (dueDate < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
              groupKey = 'Due This Week';
            } else if (dueDate < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) {
              groupKey = 'Due This Month';
            } else {
              groupKey = 'Due Later';
            }
          }
          break;
        default:
          groupKey = 'All Documents';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(doc);
    });

    return groups;
  }, [filteredAndSortedDocuments, groupBy]);

  const handleView = (document: Document) => {
    setSelectedDocument(document);
    setIsViewerOpen(true);
  };

  const handleEdit = (document: Document) => {
    console.log('Edit document:', document);
  };

  const handleDownload = (document: Document) => {
    console.log('Download document:', document);
  };

  const handleDelete = (documentId: string) => {
    setShowDeleteConfirm(documentId);
  };

  const confirmDelete = async (documentId: string) => {
    setDeletingId(documentId);
    setShowDeleteConfirm(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const document = mockDocuments.find(doc => doc.id === documentId);
      const documentName = document?.name || 'Document';
      
      // Show success toast
      setShowToast({
        show: true,
        message: `"${documentName}" has been deleted successfully`,
        type: 'success'
      });
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast({ show: false, message: '', type: 'success' });
      }, 3000);
      
    } catch (error) {
      setShowToast({
        show: true,
        message: 'Failed to delete document',
        type: 'error'
      });
      
      setTimeout(() => {
        setShowToast({ show: false, message: '', type: 'success' });
      }, 3000);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  // Reset filter when groupBy changes
  const handleGroupByChange = (newGroupBy: string) => {
    setGroupBy(newGroupBy);
    setFilterValue('all');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showToast.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${
            showToast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            <span>{showToast.message}</span>
            <button
              onClick={() => setShowToast({ show: false, message: '', type: 'success' })}
              className="text-white hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Single Line Controls */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative" style={{ width: '256px' }}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Group By */}
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Group By:</label>
          <select
            value={groupBy}
            onChange={(e) => handleGroupByChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="none">None</option>
            <option value="status">Status</option>
            <option value="type">Type</option>
            <option value="version">Version</option>
            <option value="createdBy">Created By</option>
            <option value="assignedTo">Assigned To</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {getFilterOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Sort By:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Name</option>
            <option value="type">Type</option>
            <option value="status">Status</option>
            <option value="createdDate">Created Date</option>
            <option value="dueDate">Due Date</option>
            <option value="version">Version</option>
            <option value="createdBy">Created By</option>
          </select>
          <button
            onClick={toggleSortDirection}
            className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Created Date Filter */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Created:</label>
          <select
            value={createdDateFilter}
            onChange={(e) => setCreatedDateFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="space-y-6">
        {Object.entries(groupedDocuments).map(([groupName, documents]) => (
          <div key={groupName} className="bg-white rounded-lg shadow">
            {groupBy !== 'none' && (
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <h3 className="text-lg font-medium text-gray-900">{groupName}</h3>
                <p className="text-sm text-gray-500">{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Document Name</span>
                        {sortBy === 'name' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Type</span>
                        {sortBy === 'type' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('version')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Version</span>
                        {sortBy === 'version' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Status</span>
                        {sortBy === 'status' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('createdBy')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Created By</span>
                        {sortBy === 'createdBy' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('createdDate')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Created Date</span>
                        {sortBy === 'createdDate' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('dueDate')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Due Date</span>
                        {sortBy === 'dueDate' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{document.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{document.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {document.version}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={document.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getUserName(document.createdBy)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getAssigneeNames(document.assignedTo || [])}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(document.createdAt), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {document.dueDate ? format(new Date(document.dueDate), 'MMM d, yyyy') : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleView(document)}
                            className="text-gray-600 hover:text-blue-600 transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(document)}
                            className="text-gray-600 hover:text-green-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(document)}
                            className="text-gray-600 hover:text-purple-600 transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(document.id)}
                            className="text-gray-600 hover:text-red-600 transition-colors"
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
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{mockDocuments.find(doc => doc.id === showDeleteConfirm)?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(showDeleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
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