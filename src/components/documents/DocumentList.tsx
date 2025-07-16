import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Users, Calendar, SortAsc, SortDesc, Eye, Edit, Download, Trash2, FileText, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Document } from '../../types';
import { documentsApi, DocumentFilters as IDocumentFilters } from '../../api/documents';
import StatusBadge from '../Documents/StatusBadge';
import ErrorMessage from '../common/ErrorMessage';
import { mockTemplates, getDocumentTypeDisplayName } from '../../data/mockData';
import { format } from 'date-fns';
import DocumentViewer from '../Documents/DocumentViewer';
import { mockUsers } from '../../data/mockData';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [viewingDocument, setViewingDocument] = useState<string | null>(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: IDocumentFilters = {};
      if (searchTerm) filters.search = searchTerm;
      if (filterBy !== 'All Documents') filters.status = filterBy as any;
      
      const response = await documentsApi.getDocuments(filters, currentPage, itemsPerPage);
      setDocuments(response.documents);
      setTotalItems(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [searchTerm, filterBy, currentPage, itemsPerPage]);

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
    const document = documents.find(doc => doc.id === id);
    if (document) {
      setViewingDocument(id);
    }
  };

  const handleEdit = (id: string) => {
    // For now, navigate to the form builder to create a new document based on the template
    const document = documents.find(doc => doc.id === id);
    if (document && document.templateId) {
      navigate(`/builder/${document.templateId}?mode=create-document`);
    } else {
      showNotification('Cannot edit document: Template not found', 'error');
    }
  };

  const handleDownload = (id: string) => {
    showNotification('Document download started', 'success');
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

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (error) {
    return <ErrorMessage message={error} onRetry={loadDocuments} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
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

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[70vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Select Template</h2>
                <p className="text-sm text-gray-600">Choose a template to create a new document</p>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mockTemplates.map((template) => (
                  <div key={template.id} className="bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                    <div className="p-3">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 truncate" title={template.name}>
                              {template.name}
                            </h3>
                            <p className="text-xs text-gray-600 truncate">
                              {getDocumentTypeDisplayName(template.type)}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                          template.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-xs text-gray-600 mb-3">
                        <div className="flex justify-between">
                          <span>Version:</span>
                          <span className="font-medium">{template.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fields:</span>
                          <span className="font-medium">{template.fields.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sections:</span>
                          <span className="font-medium">{template.sections.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Updated:</span>
                          <span className="font-medium">{format(template.updatedAt, 'MMM d')}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleTemplateSelect(template.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm w-full justify-center"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Use Template</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {mockTemplates.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <FileText className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No templates available</h3>
                  <p className="text-gray-600 mb-4">
                    Create templates first to use them for new documents.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 pt-6 flex-shrink-0 fixed top-16 left-16 right-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600">Manage your pharmaceutical documents and templates</p>
          </div>
          <button
            onClick={handleNewDocument}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Document</span>
          </button>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between space-x-4">
          {/* Search */}
          <div className="relative min-w-[300px] mr-4 h-8">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-full pl-8 pr-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
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
                <option value="All Documents">All Documents</option>
                <option value="draft">Draft</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="pending_signature">Pending Signature</option>
                <option value="signed">Signed</option>
                <option value="rejected">Rejected</option>
                <option value="test_method">Test Method</option>
                <option value="sop">SOP</option>
                <option value="coa">COA</option>
                <option value="specification">Specification</option>
                <option value="protocol">Protocol</option>
                <option value="report">Report</option>
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
                {getSortIcon(sortBy)}
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
      <div className="flex-1 flex flex-col overflow-hidden pt-36">
        <div className="bg-white rounded-lg shadow flex flex-col h-full overflow-hidden">
            {/* Fixed Table Header - Completely Fixed */}
            <div className="flex-shrink-0 border-b border-gray-200 bg-white mt-4">
              <table className="min-w-full table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      S.No
                    </th>
                    {[
                      { key: 'Name', label: 'Name', width: 'w-48' },
                      { key: 'Type', label: 'Type', width: 'w-32' },
                      { key: 'Version', label: 'Version', width: 'w-20' },
                      { key: 'Status', label: 'Status', width: 'w-32' },
                      { key: 'Created By', label: 'Created By', width: 'w-32' },
                      { key: 'Assigned To', label: 'Assigned To', width: 'w-32' },
                      { key: 'Created Date', label: 'Created Date', width: 'w-28' },
                      { key: 'Due Date', label: 'Due Date', width: 'w-28' }
                    ].map(({ key, label, width }) => (
                      <th 
                        key={key}
                        className={`${width} px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100`}
                        onClick={() => handleSort(key)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{label}</span>
                          {getSortIcon(key)}
                        </div>
                      </th>
                    ))}
                    <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            
            {/* Scrollable Table Body */}
            <div className="flex-1 overflow-y-auto min-h-0 max-h-full">
              <table className="min-w-full table-fixed">
                <tbody className="bg-white divide-y divide-gray-200 overflow-y-auto">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Loading documents...</span>
                      </div>
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center">
                      <div className="text-gray-400 mb-4">
                        <FileText className="w-16 h-16 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                      <p className="text-gray-600 mb-4">
                        {searchTerm || filterBy !== 'All Documents' || createdFilter !== 'All Dates'
                          ? 'Try adjusting your search criteria or filters.' 
                          : 'Create your first document to get started.'}
                      </p>
                      <button
                        onClick={handleNewDocument}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Document</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  documents.map((doc, index) => (
                    <tr key={doc.id} className="hover:bg-gray-50 border-b border-gray-200">
                      <td className="w-16 px-4 py-3 text-gray-600 font-medium">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="w-48 px-4 py-3">
                        <div className="font-medium text-gray-900">{doc.name}</div>
                      </td>
                      <td className="w-32 px-4 py-3 text-gray-600">
                        {getDocumentTypeDisplayName(doc.type)}
                      </td>
                      <td className="w-20 px-4 py-3 text-gray-600">{doc.version}</td>
                      <td className="w-32 px-4 py-3">
                        <StatusBadge status={doc.status} />
                      </td>
                      <td className="w-32 px-4 py-3 text-gray-600">{doc.createdBy}</td>
                      <td className="w-32 px-4 py-3 text-gray-600">{doc.assignedTo.join(', ') || 'Unassigned'}</td>
                      <td className="w-28 px-4 py-3 text-gray-600">{new Date(doc.createdAt).toLocaleDateString()}</td>
                      <td className="w-28 px-4 py-3 text-gray-600">
                        {doc.dueDate ? new Date(doc.dueDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="w-32 px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleView(doc.id)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(doc.id)}
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc.id)}
                            className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>

          {/* Fixed Pagination */}
          {!loading && documents.length > 0 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm w-16"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-gray-700">entries</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 border rounded text-sm ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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