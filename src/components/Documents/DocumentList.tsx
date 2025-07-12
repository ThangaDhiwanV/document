import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Calendar,
  User,
  FileText,
  ChevronDown,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { mockDocuments, mockUsers, getDocumentTypeDisplayName } from '../../data/mockData';
import { Document, DocumentStatus, DocumentType } from '../../types';
import StatusBadge from './StatusBadge';
import DocumentViewer from './DocumentViewer';
import { format } from 'date-fns';
import { generateDocumentPDF } from '../../utils/pdfGenerator';

type SortField = 'name' | 'type' | 'status' | 'createdBy' | 'createdAt' | 'dueDate' | 'version';
type SortOrder = 'asc' | 'desc';
type GroupBy = 'none' | 'status' | 'type' | 'createdBy' | 'dueDate';

const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all');
  const [filterCreatedBy, setFilterCreatedBy] = useState<string | 'all'>('all');
  const [filterDateRange, setFilterDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesCreatedBy = filterCreatedBy === 'all' || doc.createdBy === filterCreatedBy;
    
    let matchesDateRange = true;
    if (filterDateRange.start || filterDateRange.end) {
      const docDate = new Date(doc.createdAt);
      if (filterDateRange.start) {
        matchesDateRange = matchesDateRange && docDate >= new Date(filterDateRange.start);
      }
      if (filterDateRange.end) {
        matchesDateRange = matchesDateRange && docDate <= new Date(filterDateRange.end);
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesCreatedBy && matchesDateRange;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'createdBy') {
      aValue = getCreatorName(a.createdBy);
      bValue = getCreatorName(b.createdBy);
    } else if (sortField === 'createdAt' || sortField === 'dueDate') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const groupedDocuments = () => {
    if (groupBy === 'none') return { 'All Documents': sortedDocuments };

    const groups: Record<string, Document[]> = {};
    
    sortedDocuments.forEach(doc => {
      let groupKey = '';
      
      switch (groupBy) {
        case 'status':
          groupKey = doc.status.replace('_', ' ').toUpperCase();
          break;
        case 'type':
          groupKey = getDocumentTypeDisplayName(doc.type);
          break;
        case 'createdBy':
          groupKey = getCreatorName(doc.createdBy);
          break;
        case 'dueDate':
          if (doc.dueDate) {
            const dueDate = new Date(doc.dueDate);
            const today = new Date();
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) groupKey = 'Overdue';
            else if (diffDays <= 7) groupKey = 'Due This Week';
            else if (diffDays <= 30) groupKey = 'Due This Month';
            else groupKey = 'Due Later';
          } else {
            groupKey = 'No Due Date';
          }
          break;
        default:
          groupKey = 'Other';
      }
      
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(doc);
    });

    return groups;
  };

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
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
    if (doc.status === 'signed') {
      showNotification('Cannot edit a signed document. Create a new version instead.', 'error');
      return;
    }
    navigate(`/builder/${doc.templateId}?documentId=${doc.id}`);
  };

  const handleDelete = (doc: Document) => {
    if (doc.status === 'signed') {
      showNotification('Cannot delete a signed document.', 'error');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete "${doc.name}"?\n\nThis action cannot be undone.`)) {
      // In a real app, this would make an API call
      showNotification(`Document "${doc.name}" has been deleted successfully.`, 'success');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterType('all');
    setFilterCreatedBy('all');
    setFilterDateRange({ start: '', end: '' });
    setGroupBy('none');
  };

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
        )}
      </div>
    </th>
  );

  const groups = groupedDocuments();

  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600 mt-1">Manage your pharmaceutical documents and templates</p>
          </div>
          <button 
            onClick={handleNewDocument}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Document</span>
          </button>
        </div>

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

        {/* Document Viewer Modal */}
        {viewingDocument && (
          <DocumentViewer
            document={viewingDocument}
            users={mockUsers}
            onClose={() => setViewingDocument(null)}
            onDownload={() => handleDownload(viewingDocument)}
          />
        )}

        <div className="space-y-6">
          {/* Search and Basic Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as DocumentStatus | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as DocumentType | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="test_method">Test Method</option>
                  <option value="sop">SOP</option>
                  <option value="coa">COA</option>
                  <option value="specification">Specification</option>
                  <option value="protocol">Protocol</option>
                  <option value="report">Report</option>
                </select>

                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="none">No Grouping</option>
                  <option value="status">Group by Status</option>
                  <option value="type">Group by Type</option>
                  <option value="createdBy">Group by Creator</option>
                  <option value="dueDate">Group by Due Date</option>
                </select>
                
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors ${
                    showAdvancedFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>Advanced</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                </button>

                {(searchTerm || filterStatus !== 'all' || filterType !== 'all' || filterCreatedBy !== 'all' || filterDateRange.start || filterDateRange.end) && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                    <select
                      value={filterCreatedBy}
                      onChange={(e) => setFilterCreatedBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Users</option>
                      {mockUsers.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created From</label>
                    <input
                      type="date"
                      value={filterDateRange.start}
                      onChange={(e) => setFilterDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created To</label>
                    <input
                      type="date"
                      value={filterDateRange.end}
                      onChange={(e) => setFilterDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {sortedDocuments.length} of {mockDocuments.length} documents
              {groupBy !== 'none' && ` in ${Object.keys(groups).length} groups`}
            </span>
            <div className="flex items-center space-x-4">
              <span>Sort by: {sortField.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
              <span>Order: {sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
            </div>
          </div>

          {/* Document List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {Object.entries(groups).map(([groupName, documents]) => (
              <div key={groupName}>
                {groupBy !== 'none' && (
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Grid3X3 className="w-4 h-4 text-gray-500" />
                      <h3 className="font-medium text-gray-900">{groupName}</h3>
                      <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                        {documents.length}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <SortableHeader field="name">Document</SortableHeader>
                        <SortableHeader field="version">Version</SortableHeader>
                        <SortableHeader field="type">Type</SortableHeader>
                        <SortableHeader field="status">Status</SortableHeader>
                        <SortableHeader field="createdBy">Created By</SortableHeader>
                        <SortableHeader field="createdAt">Created Date</SortableHeader>
                        <SortableHeader field="dueDate">Due Date</SortableHeader>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {documents.map((document) => {
                        const isOverdue = document.dueDate && new Date(document.dueDate) < new Date();
                        const isDueSoon = document.dueDate && new Date(document.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                        
                        return (
                          <tr key={document.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {document.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ID: {document.id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                v{document.version}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">
                                {getDocumentTypeDisplayName(document.type)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={document.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900">
                                  {getCreatorName(document.createdBy)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">
                                  {format(new Date(document.createdAt), 'MMM d, yyyy')}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {document.dueDate ? (
                                <div className="flex items-center space-x-2">
                                  <Calendar className={`w-4 h-4 ${isOverdue ? 'text-red-500' : isDueSoon ? 'text-orange-500' : 'text-gray-400'}`} />
                                  <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : isDueSoon ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                                    {format(new Date(document.dueDate), 'MMM d, yyyy')}
                                  </span>
                                  {isOverdue && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleView(document)}
                                  className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="View Document"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEdit(document)}
                                  disabled={document.status === 'signed'}
                                  className={`p-2 rounded-lg transition-colors ${
                                    document.status === 'signed' 
                                      ? 'text-gray-400 cursor-not-allowed' 
                                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                  }`}
                                  title={document.status === 'signed' ? 'Cannot edit signed document' : 'Edit Document'}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDownload(document)}
                                  disabled={downloadingId === document.id}
                                  className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title={downloadingId === document.id ? "Generating PDF..." : "Download Document"}
                                >
                                  <Download className={`w-4 h-4 ${downloadingId === document.id ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                  onClick={() => handleDelete(document)}
                                  disabled={document.status === 'signed'}
                                  className={`p-2 rounded-lg transition-colors ${
                                    document.status === 'signed' 
                                      ? 'text-gray-400 cursor-not-allowed' 
                                      : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                                  }`}
                                  title={document.status === 'signed' ? 'Cannot delete signed document' : 'Delete Document'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            
            {sortedDocuments.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterStatus !== 'all' || filterType !== 'all' || filterCreatedBy !== 'all' || filterDateRange.start || filterDateRange.end
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Create your first document to get started.'}
                </p>
                <button
                  onClick={handleNewDocument}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Document</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentList;