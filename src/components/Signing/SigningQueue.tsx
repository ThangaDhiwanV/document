import React, { useState, useMemo } from 'react';
import { Search, Filter, SortAsc, SortDesc, X, Grid, List, Calendar, User, FileText, AlertCircle } from 'lucide-react';
import { Document } from '../../types';
import { mockDocuments } from '../../data/mockData';
import StatusBadge from '../Documents/StatusBadge';
import KanbanView from './KanbanView';

type ViewMode = 'list' | 'kanban';
type GroupBy = 'status' | 'type' | 'assignee' | 'priority';
type SortBy = 'name' | 'date' | 'dueDate' | 'status';
type SortDirection = 'asc' | 'desc';

const SigningQueue: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState<GroupBy>('status');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('');
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);

  // Filter documents that need signing
  const signingDocuments = documents.filter(doc => 
    ['pending_signature', 'under_review', 'approved'].includes(doc.status)
  );

  // Get unique values for filters
  const uniqueStatuses = [...new Set(signingDocuments.map(doc => doc.status))];
  const uniqueTypes = [...new Set(signingDocuments.map(doc => doc.type))];
  const uniqueAssignees = [...new Set(signingDocuments.map(doc => doc.assignedTo).flat().filter(Boolean))];

  // Calculate priority based on due date
  const getDocumentPriority = (doc: Document): 'urgent' | 'normal' => {
    if (!doc.dueDate) return 'normal';
    const dueDate = new Date(doc.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 ? 'urgent' : 'normal';
  };

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = signingDocuments.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || doc.status === statusFilter;
      const matchesType = !typeFilter || doc.type === typeFilter;
      const matchesAssignee = !assigneeFilter || doc.assignedTo.includes(assigneeFilter);
      
      let matchesPriority = true;
      if (priorityFilter) {
        const priority = getDocumentPriority(doc);
        matchesPriority = priority === priorityFilter;
      }

      let matchesDateRange = true;
      if (dateRangeFilter && doc.createdAt) {
        const docDate = new Date(doc.createdAt);
        const today = new Date();
        const diffDays = Math.ceil((today.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (dateRangeFilter) {
          case 'today':
            matchesDateRange = diffDays === 0;
            break;
          case 'week':
            matchesDateRange = diffDays <= 7;
            break;
          case 'month':
            matchesDateRange = diffDays <= 30;
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesType && matchesAssignee && matchesPriority && matchesDateRange;
    });

    // Sort documents
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.createdAt || '');
          bValue = new Date(b.createdAt || '');
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
          bValue = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [signingDocuments, searchTerm, statusFilter, typeFilter, assigneeFilter, priorityFilter, dateRangeFilter, sortBy, sortDirection]);

  // Group documents
  const groupedDocuments = useMemo(() => {
    const groups: { [key: string]: Document[] } = {};
    
    filteredAndSortedDocuments.forEach(doc => {
      let groupKey: string;
      
      switch (groupBy) {
        case 'status':
          groupKey = doc.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          break;
        case 'type':
          groupKey = doc.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          break;
        case 'assignee':
          groupKey = doc.assignedTo.length > 0 ? doc.assignedTo[0] : 'Unassigned';
          break;
        case 'priority':
          groupKey = getDocumentPriority(doc) === 'urgent' ? 'Urgent' : 'Normal';
          break;
        default:
          groupKey = 'All';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(doc);
    });
    
    return groups;
  }, [filteredAndSortedDocuments, groupBy]);

  const activeFiltersCount = [statusFilter, typeFilter, assigneeFilter, priorityFilter, dateRangeFilter, searchTerm].filter(Boolean).length;

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
    setAssigneeFilter('');
    setPriorityFilter('');
    setDateRangeFilter('');
  };

  const toggleSort = (newSortBy: SortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('asc');
    }
  };

  const handleDocumentUpdate = (documentId: string, updates: Partial<Document>) => {
    setDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === documentId 
          ? { ...doc, ...updates, updatedAt: new Date() }
          : doc
      )
    );
  };

  const formatGroupName = (key: string): string => {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending_signature': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string): string => {
    return priority === 'urgent' ? 'text-red-600' : 'text-gray-600';
  };

  if (viewMode === 'kanban') {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Signing Queue</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {filteredAndSortedDocuments.length} documents requiring attention
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setViewMode('list')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className="p-2 text-blue-600 bg-blue-50 rounded-lg"
                title="Kanban View"
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 space-y-4">
            {/* Search and Group By */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="status">Group By Status</option>
                <option value="type">Group By Type</option>
                <option value="assignee">Group By Assignee</option>
                <option value="priority">Group By Priority</option>
              </select>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{formatGroupName(status)}</option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{formatGroupName(type)}</option>
                ))}
              </select>

              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Assignees</option>
                {uniqueAssignees.map(assignee => (
                  <option key={assignee} value={assignee}>{assignee}</option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="normal">Normal</option>
              </select>

              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear ({activeFiltersCount})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Kanban Content */}
        <div className="flex-1 overflow-hidden">
          <KanbanView 
            documents={filteredAndSortedDocuments} 
            groupBy={groupBy}
            onDocumentUpdate={handleDocumentUpdate}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Signing Queue</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {filteredAndSortedDocuments.length} documents requiring attention
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className="p-2 text-blue-600 bg-blue-50 rounded-lg"
              title="List View"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Kanban View"
            >
              <Grid className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 space-y-4">
          {/* Search and Group By */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="status">Group By Status</option>
              <option value="type">Group By Type</option>
              <option value="assignee">Group By Assignee</option>
              <option value="priority">Group By Priority</option>
            </select>
          </div>

          {/* Filter and Sort Controls */}
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{formatGroupName(status)}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{formatGroupName(type)}</option>
              ))}
            </select>

            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Assignees</option>
              {uniqueAssignees.map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="normal">Normal</option>
            </select>

            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            <button
              onClick={() => toggleSort('name')}
              className={`px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-1 ${
                sortBy === 'name' ? 'bg-blue-50 border-blue-300' : ''
              }`}
            >
              Name
              {sortBy === 'name' && (
                sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => toggleSort('date')}
              className={`px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-1 ${
                sortBy === 'date' ? 'bg-blue-50 border-blue-300' : ''
              }`}
            >
              Date
              {sortBy === 'date' && (
                sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => toggleSort('dueDate')}
              className={`px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-1 ${
                sortBy === 'dueDate' ? 'bg-blue-50 border-blue-300' : ''
              }`}
            >
              Due Date
              {sortBy === 'dueDate' && (
                sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear ({activeFiltersCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
        {Object.keys(groupedDocuments).length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="space-y-4 lg:space-y-6">
            {Object.entries(groupedDocuments).map(([groupName, documents]) => (
              <div key={groupName} className="bg-white rounded-lg border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                  <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    {formatGroupName(groupName)}
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {documents.length}
                    </span>
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {documents.map((doc) => {
                    const priority = getDocumentPriority(doc);
                    return (
                      <div key={doc.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {doc.name}
                              </h4>
                              {priority === 'urgent' && (
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {doc.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                              {doc.assignedTo.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {doc.assignedTo.join(', ')}
                                </span>
                              )}
                              {doc.dueDate && (
                                <span className={`flex items-center gap-1 ${getPriorityColor(priority)}`}>
                                  <Calendar className="w-3 h-3" />
                                  Due: {new Date(doc.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={doc.status} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SigningQueue;