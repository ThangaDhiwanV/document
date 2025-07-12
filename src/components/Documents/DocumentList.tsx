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
  const [groupBy, setGroupBy] = useState<'none' | 'status' | 'type' | 'assignee' | 'creator'>('none');
  const [filterBy, setFilterBy] = useState<'all' | 'my_documents' | 'assigned_to_me' | 'pending_signature' | 'recent'>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    switch (filterBy) {
      case 'my_documents':
        matchesFilter = doc.createdBy === '1'; // Current user
        break;
      case 'assigned_to_me':
        matchesFilter = doc.assignedTo.includes('1'); // Current user
        break;
      case 'pending_signature':
        matchesFilter = doc.status === 'pending_signature';
        break;
      case 'recent':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesFilter = new Date(doc.createdAt) > weekAgo;
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          
          {/* Group By and Filter */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Group by:</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="none">None</option>
                <option value="status">Status</option>
                <option value="type">Type</option>
                <option value="assignee">Assignee</option>
                <option value="creator">Creator</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Documents</option>
                <option value="my_documents">My Documents</option>
                <option value="assigned_to_me">Assigned to Me</option>
                <option value="pending_signature">Pending Signature</option>
                <option value="recent">Recent (7 days)</option>
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