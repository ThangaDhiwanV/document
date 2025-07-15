import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Document } from '../../types';
import { documentsApi, DocumentFilters as ApiDocumentFilters } from '../../api/documents';
import DocumentHeader from './DocumentHeader';
import DocumentFilters from './DocumentFilters';
import DocumentTable from './DocumentTable';
import DocumentPagination from './DocumentPagination';
import ErrorMessage from '../common/ErrorMessage';

const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState('None');
  const [filterBy, setFilterBy] = useState('All Documents');
  const [sortBy, setSortBy] = useState('Name');
  const [createdFilter, setCreatedFilter] = useState('All Dates');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [totalItems, setTotalItems] = useState(0);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: ApiDocumentFilters = {};
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

  const clearFilters = () => {
    setSearchTerm('');
    setGroupBy('None');
    setFilterBy('All Documents');
    setSortBy('Name');
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
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleView = (id: string) => {
    navigate(`/documents/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/form-builder?documentId=${id}`);
  };

  const handleDownload = (id: string) => {
    console.log('Download document:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete document:', id);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (error) {
    return <ErrorMessage message={error} onRetry={loadDocuments} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <DocumentHeader />
          <DocumentFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            filterBy={filterBy}
            onFilterByChange={setFilterBy}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            createdFilter={createdFilter}
            onCreatedFilterChange={setCreatedFilter}
            onClearFilters={clearFilters}
            activeFiltersCount={getActiveFiltersCount()}
          />
        </div>
      </div>

      <div className="p-4">
        <DocumentTable
          documents={documents}
          loading={loading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onView={handleView}
          onEdit={handleEdit}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
        
        {!loading && documents.length > 0 && (
          <DocumentPagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(newItemsPerPage) => {
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentList;