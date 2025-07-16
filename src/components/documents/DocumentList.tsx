import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Users, Calendar, SortAsc, SortDesc, Eye, Edit, Download, Trash2, FileText, AlertTriangle, CheckCircle, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Document } from '../../types';
import { documentsApi, DocumentFilters as IDocumentFilters } from '../../api/documents';
import StatusBadge from '../Documents/StatusBadge';
import ErrorMessage from '../common/ErrorMessage';
import { mockTemplates, getDocumentTypeDisplayName, mockUsers } from '../../data/mockData';
import { format } from 'date-fns';
import DocumentViewer from '../Documents/DocumentViewer';
import { generateDocumentPDF } from '../../utils/pdfGenerator';

const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState('None');
  const [filterBy, setFilterBy] = useState('All Documents');
  const [sortBy, setSortBy] = useState('Name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [createdFilter, setCreatedFilter] = useState('All Dates');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [viewingDocument, setViewingDocument] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadDocuments = async (page = currentPage, limit = itemsPerPage) => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: IDocumentFilters = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterBy !== 'All Documents') filters.status = filterBy as any;
      
      const response = await documentsApi.getDocuments(filters, page, limit);
      setDocuments(response.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments(currentPage, itemsPerPage);
  }, [searchTerm, filterBy, currentPage, itemsPerPage]);

  // Get dynamic filter options based on group by selection
  const getFilterOptions = () => {
    const baseOptions = [{ value: 'All Documents', label: 'All Documents' }];

    if (groupBy === 'Status') {
      return [
        ...baseOptions,
        { value: 'draft', label: 'Draft' },
        { value: 'under_review', label: 'Under Review' },
        { value: 'approved', label: 'Approved' },
        { value: 'pending_signature', label: 'Pending Signature' },
        { value: 'signed', label: 'Signed' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'archived', label: 'Archived' }
      ];
    } else if (groupBy === 'Type') {
      return [
        ...baseOptions,
        { value: 'test_method', label: 'Test Method' },
        { value: 'sop', label: 'SOP' },
        { value: 'coa', label: 'COA' },
        { value: 'specification', label: 'Specification' },
        { value: 'protocol', label: 'Protocol' },
        { value: 'report', label: 'Report' }
      ];
    } else if (groupBy === 'Created By') {
      return [
        ...baseOptions,
        ...mockUsers.map(user => ({ value: user.id, label: user.name }))
      ];
    } else if (groupBy === 'Assigned To') {
      return [
        ...baseOptions,
        { value: 'unassigned', label: 'Unassigned' },
        ...mockUsers.map(user => ({ value: user.id, label: user.name }))
      ];
    }

    // Default options for "None" grouping
    return [
      ...baseOptions,
      { value: 'draft', label: 'Draft' },
      { value: 'under_review', label: 'Under Review' },
      { value: 'approved', label: 'Approved' },
      { value: 'pending_signature', label: 'Pending Signature' },
      { value: 'signed', label: 'Signed' },
      { value: 'rejected', label: 'Rejected' }
    ];
  };

  const getUserName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };

  const getAssignedToNames = (assignedTo: string[]) => {
    if (assignedTo.length === 0) return 'Unassigned';
    return assignedTo.map(id => getUserName(id)).join(', ');
  };

  // Filter and sort documents
  const filteredAndSortedDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterBy !== 'All Documents') {
      if (groupBy === 'Status') {
        matchesFilter = doc.status === filterBy;
      } else if (groupBy === 'Type') {
        matchesFilter = doc.type === filterBy;
      } else if (groupBy === 'Created By') {
        matchesFilter = doc.createdBy === filterBy;
      } else if (groupBy === 'Assigned To') {
        if (filterBy === 'unassigned') {
          matchesFilter = doc.assignedTo.length === 0;
        } else {
          matchesFilter = doc.assignedTo.includes(filterBy);
        }
      } else {
        // Default filtering
        matchesFilter = doc.status === filterBy || 
                       doc.type === filterBy;
      }
    }
    
    let matchesDateFilter = true;
    if (createdFilter !== 'All Dates') {
      const now = new Date();
      const docDate = new Date(doc.createdAt);
      
      switch (createdFilter) {
        case 'Today':
          matchesDateFilter = docDate.toDateString() === now.toDateString();
          break;
        case 'This Week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDateFilter = docDate >= weekAgo;
          break;
        case 'This Month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDateFilter = docDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesFilter && matchesDateFilter;
  }).sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'Name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'Type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'Created':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'Due Date':
        aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        break;
      case 'Status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination calculations
  const totalItems = filteredAndSortedDocuments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = filteredAndSortedDocuments.slice(startIndex, endIndex);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setGroupBy('None');
    setFilterBy('All Documents');
    setSortBy('Name');
    setSortDirection('asc');
    setCreatedFilter('All Dates');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (groupBy !== 'None') count++;
    if (filterBy !== 'All Documents') count++;
    if (sortBy !== 'Name') count++;
    if (createdFilter !== 'All Dates') count++;
    return count;
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const handleView = (id: string) => {
    setViewingDocument(id);
  };

  const handleEdit = (id: string) => {
    const document = documents.find(doc => doc.id === id);
    if (!document) {
      showNotification('Document not found', 'error');
      return;
    }

    // Navigate to edit document with document ID
    navigate(`/builder/${id}?mode=edit-document`);
  };

  const handleDownload = async (id: string) => {
    const document = documents.find(doc => doc.id === id);
    if (!document) {
      showNotification('Document not found', 'error');
      return;
    }

    setDownloadingId(id);
    
    try {
      await generateDocumentPDF(document, mockUsers, {
        includeAuditTrail: true,
        includeSignatures: true,
        watermark: document.status === 'signed' ? 'SIGNED' : undefined
      });
      
      showNotification('Document downloaded successfully!', 'success');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showNotification('Error downloading document. Please try again.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = (id: string) => {
    const docToDelete = documents.find(doc => doc.id === id);
    if (docToDelete) {
      setDocumentToDelete(docToDelete);
      setDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (documentToDelete) {
      setDocuments(prev => prev.filter(doc => doc.id !== documentToDelete.id));
      showNotification('Document deleted successfully', 'success');
      setDeleteModalOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleNewDocument = () => {
    setShowTemplateModal(true);
  };

  const handleTemplateSelect = (templateId: string) => {
    setShowTemplateModal(false);
    navigate(`/builder/${templateId}?mode=create-document`);
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? <SortAsc className="w-3.5 h-3.5 text-gray-500" /> : <SortDesc className="w-3.5 h-3.5 text-gray-500" />;
  };

  if (error) {
    return <ErrorMessage message={error} onRetry={loadDocuments} />;
  }

  const viewingDoc = viewingDocument ? documents.find(doc => doc.id === viewingDocument) : null;

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
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
        </div>
      )}

      {/* Document Viewer */}
      {viewingDoc && (
        <DocumentViewer
          document={viewingDoc}
          users={mockUsers}
          onClose={() => setViewingDocument(null)}
          onDownload={() => handleDownload(viewingDoc.id)}
        />
      )}

      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8 flex-shrink-0 fixed top-16 left-16 right-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600">Manage your pharmaceutical documents and templates</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleNewDocument}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Document</span>
            </button>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between space-x-4">
          {/* Search */}
          <div className="relative min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-2 text-xs">
            {/* Group By */}
            <div className="flex items-center space-x-1 h-8">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-700 font-medium">Group By:</span>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-xs w-28 h-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="None">None</option>
                <option value="Status">Status</option>
                <option value="Type">Type</option>
                <option value="Created By">Created By</option>
                <option value="Assigned To">Assigned To</option>
              </select>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-1 h-8">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-700 font-medium">Filter:</span>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-xs w-36 h-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {getFilterOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-1 h-8">
              <span className="text-gray-700 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-xs w-28 h-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Name">Name</option>
                <option value="Type">Type</option>
                <option value="Created">Created</option>
                <option value="Due Date">Due Date</option>
                <option value="Status">Status</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="hover:bg-gray-100 rounded-md border border-gray-300 transition-colors h-8 w-8 flex items-center justify-center"
                title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortDirection === 'asc' ? 
                  <SortAsc className="w-3.5 h-3.5 text-gray-500" /> : 
                  <SortDesc className="w-3.5 h-3.5 text-gray-500" />
                }
              </button>
            </div>

            {/* Created Date Filter */}
            <div className="flex items-center space-x-1 h-8">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-700 font-medium">Created:</span>
              <select
                value={createdFilter}
                onChange={(e) => setCreatedFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-xs w-[120px] h-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All Dates">All Dates</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className={`h-8 px-2 py-1 border rounded-md transition-colors text-xs relative flex items-center ${
                getActiveFiltersCount() > 0 
                  ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' 
                  : 'text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Clear
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden pt-44 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="h-full px-6 pt-4 flex flex-col">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
              {/* Fixed Header */}
              <div className="flex-shrink-0 overflow-x-auto border-b border-gray-200">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        S.No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>
              
              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto overflow-x-auto">
                <table className="min-w-full">
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedDocuments.map((doc, index) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                              <div className="text-sm text-gray-500">v{doc.version}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getDocumentTypeDisplayName(doc.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={doc.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getUserName(doc.createdBy)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getAssignedToNames(doc.assignedTo)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(doc.createdAt, 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleView(doc.id)}
                              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(doc.id)}
                              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(doc.id)}
                              disabled={downloadingId === doc.id}
                              className="text-purple-600 hover:text-purple-900 p-1 hover:bg-purple-50 rounded disabled:opacity-50"
                              title="Download"
                            >
                              <Download className={`w-4 h-4 ${downloadingId === doc.id ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm w-16"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-700">
                    of {totalItems} results
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="First Page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm rounded ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Last Page"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {paginatedDocuments.length === 0 && !loading && (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first document.</p>
                <button
                  onClick={handleNewDocument}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Document
                </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Select Template</h2>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600">{getDocumentTypeDisplayName(template.type)}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {template.fields.length} fields • Version {template.version}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && documentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Document</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone.</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete "{documentToDelete.name}"?
              </p>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setDocumentToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;