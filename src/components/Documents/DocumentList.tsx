import React, { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, X, FileText, Calendar, User, Tag, Clock, Eye, Edit, Trash2, Download } from 'lucide-react';
import { Document } from '../../types';
import { mockDocuments } from '../../data/mockData';
import StatusBadge from './StatusBadge';

const DocumentList: React.FC = () => {
  const [documents] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState<string>('none');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Get unique values for filters
  const uniqueStatuses = [...new Set(documents.map(doc => doc.status))];
  const uniqueTypes = [...new Set(documents.map(doc => doc.type))];
  const uniqueAssignees = [...new Set(documents.map(doc => doc.assignedTo))];

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
      const matchesType = filterType === 'all' || doc.type === filterType;
      const matchesAssignee = filterAssignee === 'all' || doc.assignedTo === filterAssignee;
      
      let matchesDateRange = true;
      if (filterDateRange !== 'all') {
        const docDate = new Date(doc.createdAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filterDateRange) {
          case 'today':
            matchesDateRange = daysDiff === 0;
            break;
          case 'week':
            matchesDateRange = daysDiff <= 7;
            break;
          case 'month':
            matchesDateRange = daysDiff <= 30;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesType && matchesAssignee && matchesDateRange;
    });
  }, [documents, searchTerm, filterStatus, filterType, filterAssignee, filterDateRange]);

  // Sort documents
  const sortedDocuments = useMemo(() => {
    const sorted = [...filteredDocuments].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'type':
          aValue = a.type.toLowerCase();
          bValue = b.type.toLowerCase();
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate) : new Date(0);
          bValue = b.dueDate ? new Date(b.dueDate) : new Date(0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredDocuments, sortBy, sortDirection]);

  // Group documents
  const groupedDocuments = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Documents': sortedDocuments };
    }

    const groups: { [key: string]: Document[] } = {};
    
    sortedDocuments.forEach(doc => {
      let groupKey: string;
      
      switch (groupBy) {
        case 'status':
          groupKey = doc.status;
          break;
        case 'type':
          groupKey = doc.type;
          break;
        case 'createdBy':
          groupKey = doc.createdBy;
          break;
        case 'assignedTo':
          groupKey = doc.assignedTo;
          break;
        case 'dueDate':
          if (doc.dueDate) {
            const dueDate = new Date(doc.dueDate);
            const now = new Date();
            const daysDiff = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff < 0) groupKey = 'Overdue';
            else if (daysDiff === 0) groupKey = 'Due Today';
            else if (daysDiff <= 7) groupKey = 'Due This Week';
            else groupKey = 'Due Later';
          } else {
            groupKey = 'No Due Date';
          }
          break;
        default:
          groupKey = 'Other';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(doc);
    });

    return groups;
  }, [sortedDocuments, groupBy]);

  const activeFiltersCount = [
    filterStatus !== 'all',
    filterType !== 'all',
    filterAssignee !== 'all',
    filterDateRange !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterType('all');
    setFilterAssignee('all');
    setFilterDateRange('all');
    setGroupBy('none');
    setSortBy('name');
    setSortDirection('asc');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Documents</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base">
          New Document
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border space-y-3 sm:space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Group By */}
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="none">Group By</option>
            <option value="status">Status</option>
            <option value="type">Type</option>
            <option value="createdBy">Created By</option>
            <option value="assignedTo">Assigned To</option>
            <option value="dueDate">Due Date</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="all">All Status</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Assignee Filter */}
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="all">All Assignees</option>
            {uniqueAssignees.map(assignee => (
              <option key={assignee} value={assignee}>{assignee}</option>
            ))}
          </select>

          {/* Date Range Filter */}
          <select
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="name">Sort by Name</option>
              <option value="type">Sort by Type</option>
              <option value="status">Sort by Status</option>
              <option value="createdAt">Sort by Created</option>
              <option value="dueDate">Sort by Due Date</option>
            </select>
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Active Filters and Clear */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-sm text-gray-600">
              {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
            </span>
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Documents List */}
      <div className="space-y-4 sm:space-y-6">
        {Object.entries(groupedDocuments).map(([groupName, groupDocs]) => (
          <div key={groupName} className="space-y-3 sm:space-y-4">
            {groupBy !== 'none' && (
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">{groupName}</h2>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                  {groupDocs.length}
                </span>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {groupDocs.map((document) => (
                <div
                  key={document.id}
                  className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{document.name}</h3>
                        <p className="text-sm text-gray-600">{document.type}</p>
                      </div>
                    </div>
                    <StatusBadge status={document.status} />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Assigned to {document.assignedTo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>Created {formatDate(document.createdAt)}</span>
                    </div>
                    {document.dueDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>Due {formatDate(document.dueDate)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedDocuments.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
          <button
            onClick={clearAllFilters}
            className="text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentList;