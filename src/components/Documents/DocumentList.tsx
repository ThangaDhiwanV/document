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
  status: 'Draft' | 'Under Review' | 'Approved' | 'Rejected' | 'Pending Signature' | 'Signed';
  createdBy: string;
  assignedTo: string | string[];
  createdDate: string;
  dueDate?: string;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Aspirin HPLC Method Validation',
    type: 'Test Method',
    version: 'v1.0',
    status: 'Pending Signature',
    createdBy: 'Michael Rodriguez',
    assignedTo: ['Dr. Sarah Chen', 'Dr. Emily Watson'],
    createdDate: 'Jan 22, 2024',
    dueDate: 'Feb 01, 2024'
  },
  {
    id: '2',
    name: 'Paracetamol Batch COA-2024-001',
    type: 'Certificate of Analysis',
    version: 'v1.0',
    status: 'Signed',
    createdBy: 'Michael Rodriguez',
    assignedTo: 'Dr. Sarah Chen',
    createdDate: 'Jan 20, 2024'
  },
  {
    id: '3',
    name: 'Losartan HPLC Assay Method',
    type: 'Test Method',
    version: 'v1.0',
    status: 'Rejected',
    createdBy: 'Michael Rodriguez',
    assignedTo: 'Dr. Emily Watson',
    createdDate: 'Jan 20, 2024'
  },
  {
    id: '4',
    name: 'Ibuprofen HPLC Method Development',
    type: 'Test Method',
    version: 'v1.1',
    status: 'Under Review',
    createdBy: 'Michael Rodriguez',
    assignedTo: ['Dr. Sarah Chen', 'James Thompson'],
    createdDate: 'Jan 24, 2024',
    dueDate: 'Feb 05, 2024'
  },
  {
    id: '5',
    name: 'Metformin Batch COA-2024-002',
    type: 'Certificate of Analysis',
    version: 'v1.0',
    status: 'Approved',
    createdBy: 'James Thompson',
    assignedTo: 'Dr. Sarah Chen',
    createdDate: 'Jan 25, 2024'
  },
  {
    id: '6',
    name: 'Atorvastatin Stability Study - 12 Months',
    type: 'Validation Protocol',
    version: 'v1.0',
    status: 'Draft',
    createdBy: 'Dr. Emily Watson',
    assignedTo: ['Dr. Sarah Chen', 'Michael Rodriguez'],
    createdDate: 'Jan 26, 2024',
    dueDate: 'Feb 10, 2024'
  },
  {
    id: '7',
    name: 'Amoxicillin Batch COA-2024-003',
    type: 'Certificate of Analysis',
    version: 'v1.0',
    status: 'Pending Signature',
    createdBy: 'Michael Rodriguez',
    assignedTo: 'Dr. Sarah Chen',
    createdDate: 'Jan 27, 2024',
    dueDate: 'Jan 30, 2024'
  },
  {
    id: '8',
    name: 'Lisinopril Batch COA-2024-004',
    type: 'Certificate of Analysis',
    version: 'v1.0',
    status: 'Signed',
    createdBy: 'James Thompson',
    assignedTo: ['Dr. Sarah Chen', 'Dr. Emily Watson'],
    createdDate: 'Jan 28, 2024'
  },
  {
    id: '9',
    name: 'Untitled Form',
    type: 'Test Method',
    version: 'v1.0',
    status: 'Draft',
    createdBy: 'Dr. Sarah Chen',
    assignedTo: 'Unassigned',
    createdDate: 'Jul 15, 2025'
  },
  {
    id: '10',
    name: 'Untitled Form',
    type: 'Test Method',
    version: 'v1.0',
    status: 'Draft',
    createdBy: 'Dr. Sarah Chen',
    assignedTo: 'Unassigned',
    createdDate: 'Jul 15, 2025'
  }
];

const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState('None');
  const [filterBy, setFilterBy] = useState('All Documents');
  const [sortBy, setSortBy] = useState('Name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [createdFilter, setCreatedFilter] = useState('All Dates');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = mockDocuments.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === 'All Documents' || doc.status === filterBy;
      
      return matchesSearch && matchesFilter;
    });

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
          aValue = a.version;
          bValue = b.version;
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
          aValue = Array.isArray(a.assignedTo) ? a.assignedTo.join(', ') : a.assignedTo;
          bValue = Array.isArray(b.assignedTo) ? b.assignedTo.join(', ') : b.assignedTo;
          break;
        case 'Created Date':
          aValue = new Date(a.createdDate).getTime();
          bValue = new Date(b.createdDate).getTime();
          break;
        case 'Due Date':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    return filtered;
  }, [searchTerm, groupBy, filterBy, sortBy, sortDirection, createdFilter]);

  const totalPages = Math.ceil(filteredAndSortedDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocuments = filteredAndSortedDocuments.slice(startIndex, endIndex);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = (doc: Document) => {
    setDocumentToDelete(doc);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (documentToDelete) {
      setToastMessage(`Document "${documentToDelete.name}" has been deleted successfully.`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
    setDeleteModalOpen(false);
    setDocumentToDelete(null);
  };

  const handleEdit = (doc: Document) => {
    navigate(`/form-builder?mode=edit&documentId=${doc.id}`);
  };

  const handleView = (doc: Document) => {
    navigate(`/documents/${doc.id}`);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const formatAssignedTo = (assignedTo: string | string[]) => {
    if (Array.isArray(assignedTo)) {
      if (assignedTo.length === 0) return 'Unassigned';
      if (assignedTo.length === 1) return assignedTo[0];
      return `${assignedTo.length} users`;
    }
    return assignedTo || 'Unassigned';
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <Trash2 className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{documentToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section - Sticky */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-6">
        {/* Title and New Document Button */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600 mt-1">Manage your pharmaceutical documents and templates</p>
          </div>
          <button
            onClick={() => navigate('/form-builder')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Document</span>
          </button>
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
          <div className="flex items-center space-x-3 text-sm">
            {/* Group By */}
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 font-medium">Group:</span>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm min-w-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="None">None</option>
                <option value="Status">Status</option>
                <option value="Type">Type</option>
                <option value="Version">Version</option>
                <option value="Created By">Created By</option>
                <option value="Assigned To">Assigned To</option>
                <option value="Due Date">Due Date</option>
              </select>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 font-medium">Filter:</span>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm min-w-[140px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All Documents">All Documents</option>
                <option value="Draft">Draft</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Pending Signature">Pending Signature</option>
                <option value="Signed">Signed</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-700 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm min-w-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                {sortDirection === 'asc' ? 
                  <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                }
              </button>
            </div>

            {/* Created Date Filter */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 font-medium">Created:</span>
              <select
                value={createdFilter}
                onChange={(e) => setCreatedFilter(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm min-w-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All Dates">All Dates</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Last 30 Days">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container - Scrollable */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white">
          <table className="w-full">
            {/* Sticky Table Header */}
            <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('Name')}>
                  <div className="flex items-center space-x-1">
                    <span>Document Name</span>
                    {sortBy === 'Name' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('Type')}>
                  <div className="flex items-center space-x-1">
                    <span>Type</span>
                    {sortBy === 'Type' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('Version')}>
                  <div className="flex items-center space-x-1">
                    <span>Version</span>
                    {sortBy === 'Version' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('Status')}>
                  <div className="flex items-center space-x-1">
                    <span>Status</span>
                    {sortBy === 'Status' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('Created By')}>
                  <div className="flex items-center space-x-1">
                    <span>Created By</span>
                    {sortBy === 'Created By' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('Assigned To')}>
                  <div className="flex items-center space-x-1">
                    <span>Assigned To</span>
                    {sortBy === 'Assigned To' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('Created Date')}>
                  <div className="flex items-center space-x-1">
                    <span>Created Date</span>
                    {sortBy === 'Created Date' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('Due Date')}>
                  <div className="flex items-center space-x-1">
                    <span>Due Date</span>
                    {sortBy === 'Due Date' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {doc.type === 'Test Method' ? '📋' : '📄'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {doc.version}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.createdBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatAssignedTo(doc.assignedTo)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.createdDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.dueDate || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(doc)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(doc)}
                        className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc)}
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
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
      </div>

      {/* Pagination - Fixed at bottom */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">per page</span>
            </div>
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedDocuments.length)} of {filteredAndSortedDocuments.length} documents
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Page</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    handlePageChange(page);
                  }
                }}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
              />
              <span className="text-sm text-gray-700">of {totalPages}</span>
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentList;