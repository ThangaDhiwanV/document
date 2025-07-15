import React, { useState } from 'react';
import { PenTool, Clock, CheckCircle, User, FileText, AlertTriangle, Download, X, Eye, Filter, LayoutGrid, List, Search, SortAsc, SortDesc, Calendar, Users } from 'lucide-react';
import { mockDocuments, mockUsers } from '../../data/mockData';
import { DocumentStatus, DocumentType } from '../../types';
import { format } from 'date-fns';
import DocuSealForm from './DocuSealForm';
import DocumentViewer from '../Documents/DocumentViewer';
import KanbanView from './KanbanView';
import { generateDocumentPDF } from '../../utils/pdfGenerator';

const SigningQueue: React.FC = () => {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [viewingDocument, setViewingDocument] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState('Status');
  const [filterBy, setFilterBy] = useState('All Documents');
  const [sortBy, setSortBy] = useState('Name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [createdFilter, setCreatedFilter] = useState('All Dates');
  const [documents, setDocuments] = useState(mockDocuments);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'All Documents' || 
                         doc.status === filterBy ||
                         doc.type === filterBy ||
                         (filterBy === 'Urgent' && doc.dueDate && new Date(doc.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)) ||
                         (filterBy === 'Normal' && (!doc.dueDate || new Date(doc.dueDate) >= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)));
    
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

  const pendingDocuments = filteredDocuments.filter(doc => 
    doc.status === 'pending_signature' || doc.status === 'under_review'
  );

  const signedDocuments = filteredDocuments.filter(doc => doc.status === 'signed');

  const getUserName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleSign = (documentId: string) => {
    setSelectedDocument(documentId);
  };

  const handlePreview = (documentId: string) => {
    setViewingDocument(documentId);
  };

  const handleSigningComplete = () => {
    setSelectedDocument(null);
    showNotification('Document signed successfully!', 'success');
  };

  const handleMoveDocument = (documentId: string, newStatus: DocumentStatus, newAssignee?: string, newType?: DocumentType) => {
    setDocuments(prevDocs => 
      prevDocs.map(doc => {
        if (doc.id === documentId) {
          const updates: any = {};
          
          if (newStatus && newStatus !== doc.status) {
            updates.status = newStatus;
          }
          
          if (newAssignee && newAssignee !== 'unassigned') {
            updates.assignedTo = [newAssignee];
          } else if (newAssignee === '' || newAssignee === 'unassigned') {
            updates.assignedTo = [];
          }
          
          if (newType) {
            updates.type = newType;
          }
          
          return { ...doc, ...updates };
        }
        return doc;
      })
    );
    
    let message = 'Document updated successfully';
    if (newStatus) message = `Document moved to ${newStatus.replace('_', ' ')}`;
    if (newType) message += ` and changed to ${newType.replace('_', ' ')}`;
    if (newAssignee) message += ` and assigned to ${getUserName(newAssignee)}`;
    
    showNotification(message, 'success');
  };

  const handleDownload = async (documentId: string) => {
    const document = documents.find(doc => doc.id === documentId);
    if (!document) return;

    setDownloadingId(documentId);
    
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

  const handleDelete = (documentId: string) => {
    setDocumentToDelete(documentId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (documentToDelete) {
      setDocuments(prev => prev.filter(doc => doc.id !== documentToDelete));
      showNotification('Document deleted successfully!', 'success');
    }
    setDeleteModalOpen(false);
    setDocumentToDelete(null);
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setGroupBy('Status');
    setFilterBy('All Documents');
    setSortBy('Name');
    setSortDirection('asc');
    setCreatedFilter('All Dates');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (groupBy !== 'Status') count++;
    if (filterBy !== 'All Documents') count++;
    if (createdFilter !== 'All Dates') count++;
    return count;
  };

  if (selectedDocument) {
    const document = documents.find(doc => doc.id === selectedDocument);
    if (document) {
      return (
        <DocuSealForm
          document={document}
          onComplete={handleSigningComplete}
          onCancel={() => setSelectedDocument(null)}
        />
      );
    }
  }

  const viewingDoc = viewingDocument ? documents.find(doc => doc.id === viewingDocument) : null;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Signing Queue</h1>
            <p className="text-gray-600">Review and sign pending documents</p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">Pending: {pendingDocuments.length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Signed: {signedDocuments.length}</span>
            </div>
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
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-0.5 h-8">
              <button
                onClick={() => setViewMode('list')}
                className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
                  viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Kanban View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Group By */}
            <div className="flex items-center space-x-1 h-8">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-700 font-medium">Group By:</span>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-xs w-28 h-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Status">Status</option>
                <option value="Type">Type</option>
                <option value="Assignee">Assignee</option>
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
                <option value="Urgent">Urgent</option>
                <option value="Normal">Normal</option>
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

      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 ${
          notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
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


      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'kanban' ? (
          <div className="h-full p-4">
            <KanbanView
              documents={filteredDocuments}
              users={mockUsers}
              groupBy={groupBy.toLowerCase() as 'status' | 'type' | 'assignee'}
              onSign={handleSign}
              onPreview={handlePreview}
              onDownload={handleDownload}
              downloadingId={downloadingId}
              onDelete={handleDelete}
              onMoveDocument={handleMoveDocument}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col p-4">
            {/* Pending Signatures Section */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-6xl mx-auto space-y-3">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <PenTool className="w-5 h-5 text-orange-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Pending Signatures</h2>
                      <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {pendingDocuments.length}
                      </span>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {pendingDocuments.map((document) => {
                      const isUrgent = document.dueDate && new Date(document.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
                      
                      return (
                        <div key={document.id} className="p-2 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="flex-shrink-0">
                                <FileText className="w-5 h-5 text-gray-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="text-sm font-medium text-gray-900 truncate">
                                    {document.name}
                                  </h3>
                                  {isUrgent && (
                                    <div className="flex items-center space-x-1 text-red-600">
                                      <AlertTriangle className="w-3 h-3" />
                                      <span className="text-xs font-medium">Urgent</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-4 text-xs text-gray-600">
                                  <div className="flex items-center space-x-1">
                                    <User className="w-3 h-3" />
                                    <span>{getUserName(document.createdBy)}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{format(new Date(document.createdAt), 'MMM d, yyyy')}</span>
                                  </div>
                                  {document.dueDate && (
                                    <div className="flex items-center space-x-1">
                                      <Clock className="w-3 h-3" />
                                      <span className={isUrgent ? 'text-red-600 font-medium' : ''}>
                                        Due {format(new Date(document.dueDate), 'MMM d, yyyy')}
                                      </span>
                                    </div>
                                  )}
                                  <span className="text-gray-400">•</span>
                                  <span>{document.type.replace('_', ' ').toUpperCase()}</span>
                                  <span className="text-gray-400">•</span>
                                  <span>v{document.version}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <button 
                                onClick={() => handlePreview(document.id)}
                                className="px-2 py-1 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
                              >
                                Preview
                              </button>
                              <button
                                onClick={() => handleSign(document.id)}
                                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                              >
                                Sign Document
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {pendingDocuments.length === 0 && (
                    <div className="text-center py-6">
                      <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">All caught up!</h3>
                      <p className="text-gray-600">No documents pending your signature.</p>
                    </div>
                  )}
                </div>

                {/* Recently Signed Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Recently Signed</h2>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        View All
                      </button>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {signedDocuments.slice(0, 5).map((document) => (
                      <div key={document.id} className="p-2 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 truncate">{document.name}</h3>
                              <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                                <span>
                                  Signed {document.signatures.length > 0 
                                    ? format(new Date(document.signatures[0].signedAt), 'MMM d, yyyy HH:mm')
                                    : 'Unknown'}
                                </span>
                                <span>v{document.version}</span>
                                <span>{document.signatures.length} signature{document.signatures.length !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handlePreview(document.id)}
                              className="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDownload(document.id)}
                              disabled={downloadingId === document.id}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1 border border-blue-300 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
                            >
                              {downloadingId === document.id ? 'Generating...' : 'Download'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {signedDocuments.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No signed documents yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SigningQueue;