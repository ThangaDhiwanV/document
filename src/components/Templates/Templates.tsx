import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, SortAsc, SortDesc, X, Copy, Trash2, Edit, Eye, Calendar, User, FileText, Hash, Grid, List } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  type: string;
  status: 'Active' | 'Draft' | 'Archived';
  createdBy: string;
  updatedDate: string;
  fieldCount: number;
  description: string;
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Certificate of Analysis',
    type: 'COA',
    status: 'Active',
    createdBy: 'John Smith',
    updatedDate: '2024-01-15',
    fieldCount: 12,
    description: 'Standard COA template for pharmaceutical products'
  },
  {
    id: '2',
    name: 'Test Method Validation',
    type: 'Test Methods',
    status: 'Active',
    createdBy: 'Sarah Johnson',
    updatedDate: '2024-01-14',
    fieldCount: 8,
    description: 'Template for analytical method validation'
  },
  {
    id: '3',
    name: 'SOP Template',
    type: 'SOPs',
    status: 'Draft',
    createdBy: 'Mike Wilson',
    updatedDate: '2024-01-13',
    fieldCount: 15,
    description: 'Standard operating procedure template'
  },
  {
    id: '4',
    name: 'Protocol Template',
    type: 'Protocols',
    status: 'Active',
    createdBy: 'Emily Davis',
    updatedDate: '2024-01-12',
    fieldCount: 10,
    description: 'Clinical protocol template'
  },
  {
    id: '5',
    name: 'Specification Document',
    type: 'Specifications',
    status: 'Active',
    createdBy: 'David Brown',
    updatedDate: '2024-01-11',
    fieldCount: 6,
    description: 'Product specification template'
  },
  {
    id: '6',
    name: 'Analytical Report',
    type: 'Reports',
    status: 'Archived',
    createdBy: 'Lisa Anderson',
    updatedDate: '2024-01-10',
    fieldCount: 9,
    description: 'Analytical testing report template'
  }
];

const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [groupBy, setGroupBy] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const types = ['COA', 'Test Methods', 'SOPs', 'Protocols', 'Specifications', 'Reports'];
  const statuses = ['Active', 'Draft', 'Archived'];

  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !selectedType || template.type === selectedType;
      const matchesStatus = !selectedStatus || template.status === selectedStatus;
      
      let matchesDate = true;
      if (dateRange) {
        const templateDate = new Date(template.updatedDate);
        const now = new Date();
        
        switch (dateRange) {
          case 'today':
            matchesDate = templateDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = templateDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = templateDate >= monthAgo;
            break;
        }
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });

    // Sort templates
    filtered.sort((a, b) => {
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
        case 'updatedDate':
          aValue = new Date(a.updatedDate);
          bValue = new Date(b.updatedDate);
          break;
        case 'fieldCount':
          aValue = a.fieldCount;
          bValue = b.fieldCount;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [templates, searchTerm, selectedType, selectedStatus, dateRange, sortBy, sortDirection]);

  const groupedTemplates = useMemo(() => {
    if (!groupBy) return { 'All Templates': filteredAndSortedTemplates };

    const groups: { [key: string]: Template[] } = {};
    
    filteredAndSortedTemplates.forEach(template => {
      let groupKey: string;
      
      switch (groupBy) {
        case 'type':
          groupKey = template.type;
          break;
        case 'status':
          groupKey = template.status;
          break;
        case 'createdBy':
          groupKey = template.createdBy;
          break;
        case 'updatedDate':
          const date = new Date(template.updatedDate);
          groupKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
          break;
        default:
          groupKey = 'All Templates';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(template);
    });

    return groups;
  }, [filteredAndSortedTemplates, groupBy]);

  const activeFiltersCount = [searchTerm, selectedType, selectedStatus, dateRange, groupBy].filter(Boolean).length;

  const handleDuplicate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      status: 'Draft',
      updatedDate: new Date().toISOString().split('T')[0]
    };
    setTemplates([...templates, newTemplate]);
  };

  const handleDelete = (templateId: string) => {
    setTemplateToDelete(templateId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      setTemplates(templates.filter(t => t.id !== templateToDelete));
      setTemplateToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedStatus('');
    setDateRange('');
    setGroupBy('');
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Document Templates</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage and organize your document templates ({filteredAndSortedTemplates.length} templates)
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 w-fit">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Template</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Group By */}
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="">Group By</option>
            <option value="type">Type</option>
            <option value="status">Status</option>
            <option value="createdBy">Created By</option>
            <option value="updatedDate">Updated Date</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="">All Types</option>
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="type">Sort by Type</option>
            <option value="updatedDate">Sort by Date</option>
            <option value="fieldCount">Sort by Fields</option>
          </select>

          {/* Sort Direction & Clear */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
            
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1 text-sm"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Clear</span>
                <span className="bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full text-xs font-medium">
                  {activeFiltersCount}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="space-y-6">
        {Object.entries(groupedTemplates).map(([groupName, groupTemplates]) => (
          <div key={groupName}>
            {groupBy && (
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                {groupName}
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-normal">
                  {groupTemplates.length}
                </span>
              </h2>
            )}
            
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {groupTemplates.map((template) => (
                  <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base" title={template.name}>
                          {template.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">{template.type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        template.status === 'Active' ? 'bg-green-100 text-green-800' :
                        template.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {template.status}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
                      {template.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <User className="w-3 h-3" />
                        <span>{template.createdBy}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(template.updatedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Hash className="w-3 h-3" />
                        <span>{template.fieldCount} fields</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center justify-center gap-1">
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDuplicate(template)}
                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(template.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Template
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fields
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Updated
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {groupTemplates.map((template) => (
                        <tr key={template.id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <FileText className="w-5 h-5 text-indigo-600 mr-3 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">{template.name}</div>
                                <div className="text-sm text-gray-500 truncate">{template.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {template.type}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              template.status === 'Active' ? 'bg-green-100 text-green-800' :
                              template.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {template.status}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {template.fieldCount}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(template.updatedDate).toLocaleDateString()}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button className="text-indigo-600 hover:text-indigo-900">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDuplicate(template)}
                                className="text-gray-600 hover:text-indigo-600"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(template.id)}
                                className="text-red-600 hover:text-red-900"
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
            )}
          </div>
        ))}
      </div>

      {filteredAndSortedTemplates.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
          <button
            onClick={clearFilters}
            className="text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Template</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this template? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;