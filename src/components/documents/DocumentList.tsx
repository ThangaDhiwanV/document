import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Users, Calendar, SortAsc, SortDesc, Eye, Edit, Download, Trash2, FileText, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Document } from '../../types';
import { documentsApi, DocumentFilters as IDocumentFilters } from '../../api/documents';
import StatusBadge from '../Documents/StatusBadge';
import ErrorMessage from '../common/ErrorMessage';
import { mockTemplates, getDocumentTypeDisplayName, mockUsers } from '../../data/mockData';
import { format } from 'date-fns';
import DocumentViewer from '../Documents/DocumentViewer';

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
    const document = documents.find(doc => doc.id === id);
    if (!document) {
      showNotification('Document not found', 'error');
      return;
    }

    // Check if document has a template ID
    if (document.templateId) {
      // Check if the template exists
      const template = mockTemplates.find(t => t.id === document.templateId);
      if (template) {
        navigate(`/builder/${template.id}?mode=edit-document&documentId=${document.id}`);
      } else {
        showNotification('Template not found', 'error');
      }
    } else {
      showNotification('No template associated with this document', 'error');
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
      {/* Rest of the component code... */}
    </div>
  );
};

export default DocumentList;