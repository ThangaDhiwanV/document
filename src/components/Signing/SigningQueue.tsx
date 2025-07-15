import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { PenTool, Clock, CheckCircle, User, FileText, AlertTriangle, Download, X, Eye, Filter, LayoutGrid, List, Search, SortAsc, SortDesc } from 'lucide-react';
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
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all');
  const [filterAssignee, setFilterAssignee] = useState<string | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'dueDate' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [groupBy, setGroupBy] = useState<'status' | 'type' | 'assignee'>('status');
  const [documents, setDocuments] = useState(mockDocuments);
  
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesAssignee = filterAssignee === 'all' || doc.assignedTo.includes(filterAssignee);
    
    return matchesSearch && matchesStatus && matchesType && matchesAssignee;
  }).sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'date':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'dueDate':
        aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
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
          const updates: any = { status: newStatus };
          
          if (newAssignee && newAssignee !== 'unassigned') {
            updates.assignedTo = [newAssignee];
          } else if (newAssignee === 'unassigned') {
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
    
    let message = `Document moved to ${newStatus.replace('_', ' ')}`;
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

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterType('all');
    setFilterAssignee('all');
    setSearchTerm('');
    setSortBy('date');
    setSortOrder('desc');
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
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Fixed Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 sticky top-0 z-40">
          <div className="flex items-center justify-between mb-4">
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
            {/* Left side - View Mode Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Kanban View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Right side - Filters and Controls */}
            <div className="flex items-center space-x-3 text-sm">
              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as DocumentStatus | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 min-w-[120px]"
              >
                <option value="all">All Status</option>
                <option value="pending_signature">Pending Signature</option>
                <option value="signed">Signed</option>
              </select>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as DocumentType | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 min-w-[100px]"
              >
                <option value="all">All Types</option>
                <option value="test_method">Test Method</option>
                <option value="sop">SOP</option>
                <option value="coa">COA</option>
              </select>

              {/* Group By (Kanban only) */}
              {viewMode === 'kanban' && (
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as 'status' | 'type' | 'assignee')}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                >
                  <option value="status">Group by Status</option>
                  <option value="type">Group by Type</option>
                </select>
              )}

              {/* Sort */}
              <div className="flex items-center space-x-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 min-w-[80px]"
                >
                  <option value="name">Name</option>
                  <option value="date">Created</option>
                  <option value="dueDate">Due Date</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? 
                    <SortAsc className="w-4 h-4 text-gray-500" /> : 
                    <SortDesc className="w-4 h-4 text-gray-500" />
                  }
                </button>
              </div>
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
            <div className="h-full p-6">
              <KanbanView
                documents={filteredDocuments}
                users={mockUsers}
                groupBy={groupBy}
                onSign={handleSign}
                onPreview={handlePreview}
                onDownload={handleDownload}
                downloadingId={downloadingId}
                onMoveDocument={handleMoveDocument}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col p-6">
              {/* Pending Signatures Section */}
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
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
                          <div key={document.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 flex-1 min-w-0">
                                <div className="flex-shrink-0">
                                  <FileText className="w-8 h-8 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-3 mb-1">
                                    <h3 className="text-base font-medium text-gray-900 truncate">
                                      {document.name}
                                    </h3>
                                    {isUrgent && (
                                      <div className="flex items-center space-x-1 text-red-600">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span className="text-xs font-medium">Urgent</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                                    <div className="flex items-center space-x-1">
                                      <User className="w-4 h-4" />
                                      <span>{getUserName(document.createdBy)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Clock className="w-4 h-4" />
                                      <span>{format(new Date(document.createdAt), 'MMM d, yyyy')}</span>
                                    </div>
                                    {document.dueDate && (
                                      <div className="flex items-center space-x-1">
                                        <Clock className="w-4 h-4" />
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
                                  className="px-3 py-1 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
                                >
                                  Preview
                                </button>
                                <button
                                  onClick={() => handleSign(document.id)}
                                  className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
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
                      <div className="text-center py-12">
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                        <p className="text-gray-600">No documents pending your signature.</p>
                      </div>
                    )}
                  </div>

                  {/* Recently Signed Section */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
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
                        <div key={document.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-gray-900 truncate">{document.name}</h3>
                                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
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
                      <div className="text-center py-8">
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
    </DndProvider>
  );
};

export default SigningQueue;