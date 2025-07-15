import React, { useState, useMemo } from 'react';
import { Search, Filter, Users, Calendar, ChevronDown, ChevronUp, Eye, Edit, Download, Trash2, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { mockTemplates, getDocumentTypeDisplayName } from '../../data/mockData';

interface Document {
  id: string;
  name: string;
  type: string;
  version: string;
  status: 'draft' | 'under_review' | 'approved' | 'rejected';
  createdBy: string;
  assignedTo: string;
  createdDate: string;
  dueDate: string;
}

const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState('None');
  const [filterBy, setFilterBy] = useState('All Documents');
  const [sortBy, setSortBy] = useState('Name');
  const [createdFilter, setCreatedFilter] = useState('All Dates');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Mock data
  const documents: Document[] = [
    {
      id: '1',
      name: 'Test Method Validation Protocol',
      type: 'test_method',
      version: '1.2',
      status: 'approved',
      createdBy: 'Dr. Sarah Johnson',
      assignedTo: 'Mike Chen',
      createdDate: '2024-01-15',
      dueDate: '2024-02-15'
    },
    {
      id: '2',
      name: 'Certificate of Analysis Template',
      type: 'coa',
      version: '2.1',
      status: 'under_review',
      createdBy: 'Alex Rodriguez',
      assignedTo: 'Sarah Wilson',
      createdDate: '2024-01-20',
      dueDate: '2024-02-20'
    },
    {
      id: '3',
      name: 'Standard Operating Procedure',
      type: 'sop',
      version: '1.0',
      status: 'draft',
      createdBy: 'Mike Chen',
      assignedTo: 'Dr. Sarah Johnson',
      createdDate: '2024-01-25',
      dueDate: '2024-02-25'
    },
    {
      id: '4',
      name: 'Quality Control Report',
      type: 'qc_report',
      version: '1.5',
      status: 'approved',
      createdBy: 'Sarah Wilson',
      assignedTo: 'Alex Rodriguez',
      createdDate: '2024-01-10',
      dueDate: '2024-02-10'
    },
    {
      id: '5',
      name: 'Batch Record Template',
      type: 'batch_record',
      version: '3.0',
      status: 'rejected',
      createdBy: 'Dr. Sarah Johnson',
      assignedTo: 'Mike Chen',
      createdDate: '2024-01-05',
      dueDate: '2024-02-05'
    }
  ];

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

  const filteredDocuments = useMemo(() => {
    let filtered = documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === 'All Documents' || 
                          (filterBy === 'Draft' && doc.status === 'draft') ||
                          (filterBy === 'Under Review' && doc.status === 'under_review') ||
                          (filterBy === 'Approved' && doc.status === 'approved') ||
                          (filterBy === 'Rejected' && doc.status === 'rejected');

      return matchesSearch && matchesFilter;
    });

    // Sort documents
    filtered.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortBy) {
        case 'Name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'Type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'Version':
          aValue = parseFloat(a.version);
          bValue = parseFloat(b.version);
          break;
        case 'Status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'Created By':
          aValue = a.createdBy;
          bValue = b.createdBy;
          break;
        case 'Assigned To':
          aValue = a.assignedTo;
          bValue = b.assignedTo;
          break;
        case 'Created Date':
          aValue = new Date(a.createdDate).getTime();
          bValue = new Date(b.createdDate).getTime();
          break;
        case 'Due Date':
          aValue = new Date(a.dueDate).getTime();
          bValue = new Date(b.dueDate).getTime();
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
      }
    });

    return filtered;
  }, [documents, searchTerm, filterBy, sortBy, sortOrder, createdFilter]);

  const groupedDocuments = useMemo(() => {
    if (groupBy === 'None') {
      return { 'All Documents': filteredDocuments };
    }

    const groups: { [key: string]: Document[] } = {};
    
    filteredDocuments.forEach(doc => {
      let groupKey = '';
      switch (groupBy) {
        case 'Status':
          groupKey = doc.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          break;
        case 'Type':
          groupKey = getDocumentTypeDisplayName(doc.type);
          break;
        case 'Created By':
          groupKey = doc.createdBy;
          break;
        case 'Assigned To':
          groupKey = doc.assignedTo;
          break;
        default:
          groupKey = 'All Documents';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(doc);
    });

    return groups;
  }, [filteredDocuments, groupBy]);

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const handleView = (id: string) => {
    navigate(`/documents/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/builder?documentId=${id}`);
  };

  const handleDownload = (id: string) => {
    console.log('Download document:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete document:', id);
  };

  const renderDocumentRow = (doc: Document) => (
    <tr key={doc.id} className="hover:bg-gray-50 border-b border-gray-200">
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900">{doc.name}</div>
      </td>
      <td className="px-4 py-3 text-gray-600">
        {getDocumentTypeDisplayName(doc.type)}
      </td>
      <td className="px-4 py-3 text-gray-600">{doc.version}</td>
      <td className="px-4 py-3">
        <StatusBadge status={doc.status} />
      </td>
      <td className="px-4 py-3 text-gray-600">{doc.createdBy}</td>
      <td className="px-4 py-3 text-gray-600">{doc.assignedTo}</td>
      <td className="px-4 py-3 text-gray-600">{doc.createdDate}</td>
      <td className="px-4 py-3 text-gray-600">{doc.dueDate}</td>
      <td className="px-4 py-3">
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
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
              <p className="text-gray-600">Manage your pharmaceutical documents and templates</p>
            </div>
            <button
              onClick={() => navigate('/form-builder')}
              onClick={() => navigate('/builder')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Document</span>
            </button>
          </div>

          {/* Controls */}
<div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
  {/* Search */}
  <div className="relative min-w-[260px] h-8">
    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
    <input
      type="text"
      placeholder="Search documents..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full h-full pl-8 pr-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>

  {/* Group By */}
  <div className="flex items-center space-x-1 h-8">
    <Users className="w-3.5 h-3.5 text-gray-500" />
    <span className="text-gray-700 font-medium">Group By:</span>
    <select
      value={groupBy}
      onChange={(e) => setGroupBy(e.target.value)}
      className="border border-gray-300 rounded-md px-2 h-full w-28 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      className="border border-gray-300 rounded-md px-2 h-full w-36 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="All Documents">All Documents</option>
      <option value="Draft">Draft</option>
      <option value="Under Review">Under Review</option>
      <option value="Approved">Approved</option>
      <option value="Rejected">Rejected</option>
    </select>
  </div>

  {/* Sort */}
  <div className="flex items-center space-x-1 h-8">
    <span className="text-gray-700 font-medium">Sort:</span>
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="border border-gray-300 rounded-md px-2 h-full w-28 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="Name">Name</option>
      <option value="Type">Type</option>
      <option value="Version">Version</option>
      <option value="Status">Status</option>
      <option value="Created By">Created By</option>
      <option value="Assigned To">Assigned To</option>
      <option value="Created Date">Created Date</option>
      <option value="Due Date">Due Date</option>
    </select>
  </div>

  {/* Created Date Filter */}
  <div className="flex items-center space-x-1 h-8">
    <Calendar className="w-3.5 h-3.5 text-gray-500" />
    <span className="text-gray-700 font-medium">Created:</span>
    <select
      value={createdFilter}
      onChange={(e) => setCreatedFilter(e.target.value)}
      className="border border-gray-300 rounded-md px-2 h-full w-[130px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      <option value="All Dates">All Dates</option>
      <option value="Today">Today</option>
      <option value="This Week">This Week</option>
      <option value="This Month">This Month</option>
      <option value="Last 30 Days">Last 30 Days</option>
    </select>
  </div>

  {/* Clear Filters */}
  <button
    onClick={clearFilters}
    className={`h-8 px-2 border rounded-md transition-colors relative flex items-center ${
      getActiveFiltersCount() > 0
        ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
        : 'text-gray-600 border-gray-300 hover:bg-gray-50'
    }`}
  >
    Clear
    {getActiveFiltersCount() > 0 && (
      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
        {getActiveFiltersCount()}
      </span>
    )}
  </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {groupBy === 'None' ? (
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              <table className="min-w-full">
                <thead className="bg-gray-50 sticky top-0 z-20">
                  <tr>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('Name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Name</span>
                        {getSortIcon('Name')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('Type')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Type</span>
                        {getSortIcon('Type')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('Version')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Version</span>
                        {getSortIcon('Version')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('Status')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Status</span>
                        {getSortIcon('Status')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('Created By')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Created By</span>
                        {getSortIcon('Created By')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('Assigned To')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Assigned To</span>
                        {getSortIcon('Assigned To')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('Created Date')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Created Date</span>
                        {getSortIcon('Created Date')}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('Due Date')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Due Date</span>
                        {getSortIcon('Due Date')}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.slice(startIndex, endIndex).map(renderDocumentRow)}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
                <span className="text-sm text-gray-700">
                  of {filteredDocuments.length} results
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedDocuments).map(([groupName, docs]) => (
              <div key={groupName} className="bg-white rounded-lg shadow">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                  <h3 className="text-lg font-medium text-gray-900">
                    {groupName} ({docs.length})
                  </h3>
                </div>
                <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {docs.map(renderDocumentRow)}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentList;