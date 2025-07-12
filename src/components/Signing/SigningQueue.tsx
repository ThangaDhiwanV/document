import React, { useState } from 'react';
import { PenTool, Clock, CheckCircle, User, FileText, AlertTriangle, Download, X, Eye, Filter, LayoutGrid, List } from 'lucide-react';
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
  const [groupBy, setGroupBy] = useState<'status' | 'type' | 'assignee'>('status');
  
  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesStatus && matchesType;
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

  const handleDownload = async (documentId: string) => {
    const document = mockDocuments.find(doc => doc.id === documentId);
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

  if (selectedDocument) {
    const document = mockDocuments.find(doc => doc.id === selectedDocument);
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

  const viewingDoc = viewingDocument ? mockDocuments.find(doc => doc.id === viewingDocument) : null;

  return (
    <div className="space-y-6">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 fixed top-16 left-16 right-0 z-40">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Signing Queue</h1>
            <p className="text-gray-600">Review and sign pending documents</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
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

            {/* Filters */}
            <div className="flex items-center space-x-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as DocumentStatus | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="pending_signature">Pending Signature</option>
                <option value="signed">Signed</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as DocumentType | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="test_method">Test Method</option>
                <option value="sop">SOP</option>
                <option value="coa">COA</option>
                <option value="specification">Specification</option>
                <option value="protocol">Protocol</option>
                <option value="report">Report</option>
              </select>

              {viewMode === 'kanban' && (
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as 'status' | 'type' | 'assignee')}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="status">Group by Status</option>
                  <option value="type">Group by Type</option>
                  <option value="assignee">Group by Assignee</option>
                </select>
              )}
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
        </div>
      </div>

      {/* Content with top padding for fixed header */}
      <div className="pt-32">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-32 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 ${
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
        <div className="px-6">
          {viewMode === 'kanban' ? (
            <KanbanView
              documents={filteredDocuments}
              users={mockUsers}
              groupBy={groupBy}
              onSign={handleSign}
              onPreview={handlePreview}
              onDownload={handleDownload}
              downloadingId={downloadingId}
            />
          ) : (
            <div className="space-y-6">
              {/* Pending Signatures Section */}
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
                      <div key={document.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                              <h3 className="text-lg font-medium text-gray-900 truncate">
                                {document.name}
                              </h3>
                              {isUrgent && (
                                <div className="flex items-center space-x-1 text-red-600">
                                  <AlertTriangle className="w-4 h-4" />
                                  <span className="text-xs font-medium">Urgent</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4" />
                                <span>Created by {getUserName(document.createdBy)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span>Created {format(new Date(document.createdAt), 'MMM d, yyyy')}</span>
                              </div>
                              {document.dueDate && (
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4" />
                                  <span className={isUrgent ? 'text-red-600 font-medium' : ''}>
                                    Due {format(new Date(document.dueDate), 'MMM d, yyyy')}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="text-sm text-gray-500">
                              Version {document.version} • {document.type.replace('_', ' ').toUpperCase()}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 ml-4">
                            <button 
                              onClick={() => handlePreview(document.id)}
                              className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Preview</span>
                            </button>
                            <button
                              onClick={() => handleSign(document.id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                            >
                              <PenTool className="w-4 h-4" />
                              <span>Sign Document</span>
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
                    <div key={document.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{document.name}</h3>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-xs text-gray-500">
                                Signed {document.signatures.length > 0 
                                  ? format(new Date(document.signatures[0].signedAt), 'MMM d, yyyy HH:mm')
                                  : 'Unknown'}
                              </p>
                              <span className="text-xs text-gray-400">•</span>
                              <p className="text-xs text-gray-500">
                                Version {document.version}
                              </p>
                              <span className="text-xs text-gray-400">•</span>
                              <p className="text-xs text-gray-500">
                                {document.signatures.length} signature{document.signatures.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handlePreview(document.id)}
                            className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleDownload(document.id)}
                            disabled={downloadingId === document.id}
                            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Download className="w-4 h-4" />
                            <span>{downloadingId === document.id ? 'Generating...' : 'Download PDF'}</span>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default SigningQueue;