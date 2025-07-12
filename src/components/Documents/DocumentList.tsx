import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Download, Eye, Edit, Trash2, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { mockDocuments, mockUsers, getDocumentTypeDisplayName } from '../../data/mockData';
import { Document, DocumentStatus, DocumentType } from '../../types';
import StatusBadge from './StatusBadge';
import DocumentViewer from './DocumentViewer';
import { format } from 'date-fns';
import { generateDocumentPDF } from '../../utils/pdfGenerator';

const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'all'>('all');
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

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
    // In a real app, this would show a confirmation dialog
    if (window.confirm(`Are you sure you want to delete "${doc.name}"?`)) {
      console.log('Deleting document:', doc.id);
      alert('Document deleted successfully');
    }
  };

  return (
    <div className="space-y-6">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 fixed top-16 left-16 right-0 z-40">
        <div className="flex items-center justify-between">
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
      </div>

      {/* Content with top padding for fixed header */}
      <div className="pt-20">
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
        {viewingDocument && (
          <DocumentViewer
            document={viewingDocument}
            users={mockUsers}
            onClose={() => setViewingDocument(null)}
            onDownload={() => handleDownload(viewingDocument)}
          />
        )}

        <div className="px-6 space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
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
              
              <div className="flex items-center space-x-4">
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
              </div>
            </div>
          </div>

          {/* Document List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document
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
                      Created Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {document.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Version {document.version}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {getDocumentTypeDisplayName(document.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={document.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getCreatorName(document.createdBy)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(document.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {document.dueDate ? format(new Date(document.dueDate), 'MMM d, yyyy') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleView(document)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(document)}
                            className="text-gray-600 hover:text-gray-900 p-1"
                            title="Edit Document"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(document)}
                            disabled={downloadingId === document.id}
                            className="text-green-600 hover:text-green-900 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={downloadingId === document.id ? "Generating PDF..." : "Download Document"}
                          >
                            <Download className={`w-4 h-4 ${downloadingId === document.id ? 'animate-spin' : ''}`} />
                          </button>
                          <button
                            onClick={() => handleDelete(document)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete Document"
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
            
            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Create your first document to get started.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentList;