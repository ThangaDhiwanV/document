import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Copy, Eye, FileText, Filter, SortAsc, SortDesc, AlertTriangle, CheckCircle, Users, Calendar } from 'lucide-react';
import { mockTemplates, getDocumentTypeDisplayName, mockUsers } from '../../data/mockData';
import { DocumentTemplate } from '../../types';
import { format } from 'date-fns';

const Templates: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState('None');
  const [filterBy, setFilterBy] = useState('All Templates');
  const [sortBy, setSortBy] = useState('Name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [createdFilter, setCreatedFilter] = useState('All Dates');
  const [templates, setTemplates] = useState(mockTemplates);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<DocumentTemplate | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'All Templates' || 
                         (filterBy === 'Active' && template.isActive) ||
                         (filterBy === 'Inactive' && !template.isActive) ||
                         template.type === filterBy;
    
    let matchesDateFilter = true;
    if (createdFilter !== 'All Dates') {
      const now = new Date();
      const templateDate = new Date(template.createdAt);
      
      switch (createdFilter) {
        case 'Today':
          matchesDateFilter = templateDate.toDateString() === now.toDateString();
          break;
        case 'This Week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDateFilter = templateDate >= weekAgo;
          break;
        case 'This Month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDateFilter = templateDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesFilter && matchesDateFilter;
  }).sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'Name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'Type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'Updated':
        aValue = new Date(a.updatedAt).getTime();
        bValue = new Date(b.updatedAt).getTime();
        break;
      case 'Fields':
        aValue = a.fields.length;
        bValue = b.fields.length;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleNewTemplate = () => {
    navigate('/builder');
  };

  const handleEditTemplate = (templateId: string) => {
    navigate(`/builder/${templateId}`);
  };

  const handleUseTemplate = (templateId: string) => {
    navigate(`/builder/${templateId}?mode=create`);
  };

  const handleDeleteTemplate = (template: DocumentTemplate) => {
    setTemplateToDelete(template);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (templateToDelete) {
      setTemplates(prev => prev.filter(t => t.id !== templateToDelete.id));
      showNotification(`Template "${templateToDelete.name}" has been deleted successfully.`, 'success');
    }
    setDeleteModalOpen(false);
    setTemplateToDelete(null);
  };

  const handleDuplicateTemplate = (template: DocumentTemplate) => {
    const newTemplate: DocumentTemplate = {
      ...template,
      id: `tmp-${Date.now()}`,
      name: `${template.name} - Copy`,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0',
      fields: template.fields.map(field => ({
        ...field,
        id: `field-${Date.now()}-${Math.random()}`
      }))
    };
    
    setTemplates(prev => [newTemplate, ...prev]);
    showNotification(`Template "${template.name}" has been duplicated successfully.`, 'success');
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setGroupBy('None');
    setFilterBy('All Templates');
    setSortBy('Name');
    setSortDirection('asc');
    setCreatedFilter('All Dates');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (groupBy !== 'None') count++;
    if (filterBy !== 'All Templates') count++;
    if (createdFilter !== 'All Dates') count++;
    return count;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 ${
          notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
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
          </div>
        </div>
      )}

      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 sticky top-0 z-40">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Templates</h1>
            <p className="text-gray-600">Create and manage reusable document templates</p>
          </div>
          <button
            onClick={handleNewTemplate}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Template</span>
          </button>
        </div>

{/* Controls Row */}
<div className="flex items-center justify-between space-x-4">
  {/* Search */}
  <div className="relative min-w-[300px] mr-8">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
    <input
      type="text"
      placeholder="Search templates..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm h-10"
    />
  </div>

  {/* Right side controls */}
  <div className="flex items-center space-x-3 text-sm">
    {/* Group By */}
    <div className="flex items-center space-x-2 h-10">
      <Users className="w-4 h-4 text-gray-500" />
      <span className="text-gray-700 font-medium">Group By:</span>
      <select
        value={groupBy}
        onChange={(e) => setGroupBy(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-10"
      >
        <option value="None">None</option>
        <option value="Type">Type</option>
        <option value="Status">Status</option>
        <option value="Created By">Created By</option>
      </select>
    </div>

    {/* Filter */}
    <div className="flex items-center space-x-2 h-10">
      <Filter className="w-4 h-4 text-gray-500" />
      <span className="text-gray-700 font-medium">Filter:</span>
      <select
        value={filterBy}
        onChange={(e) => setFilterBy(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-36 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-10"
      >
        <option value="All Templates">All Templates</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
        <option value="test_method">Test Method</option>
        <option value="sop">SOP</option>
        <option value="coa">COA</option>
        <option value="specification">Specification</option>
        <option value="protocol">Protocol</option>
        <option value="report">Report</option>
      </select>
    </div>

    {/* Sort */}
    <div className="flex items-center space-x-2 h-10">
      <span className="text-gray-700 font-medium">Sort:</span>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-10"
      >
        <option value="Name">Name</option>
        <option value="Type">Type</option>
        <option value="Updated">Updated</option>
        <option value="Fields">Fields</option>
      </select>
      <button
        onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
        className="hover:bg-gray-100 rounded-lg transition-colors h-10 w-10 flex items-center justify-center border border-gray-300"
        title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
      >
        {sortDirection === 'asc' ? 
          <SortAsc className="w-4 h-4 text-gray-500" /> : 
          <SortDesc className="w-4 h-4 text-gray-500" />
        }
      </button>
    </div>

    {/* Created Date Filter */}
    <div className="flex items-center space-x-2 h-10">
      <Calendar className="w-4 h-4 text-gray-500" />
      <span className="text-gray-700 font-medium">Created:</span>
      <select
        value={createdFilter}
        onChange={(e) => setCreatedFilter(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-[140px] focus:ring-2 focus:ring-blue-500 focus:border-transparent h-10"
      >
        <option value="All Dates">All Dates</option>
        <option value="Today">Today</option>
        <option value="This Week">This Week</option>
        <option value="This Month">This Month</option>
      </select>
    </div>

    {/* Clear Filters */}
    <button
      onClick={clearFilters}
      className={`h-10 px-3 py-2 border rounded-lg transition-colors text-sm relative flex items-center ${
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
      <div className="flex-1 overflow-y-auto p-6">
        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate" title={template.name}>
                        {template.name}
                      </h3>
                      <p className="text-xs text-gray-600 truncate">
                        {getDocumentTypeDisplayName(template.type)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                    template.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                  <div className="flex justify-between">
                    <span>Version:</span>
                    <span className="font-medium">{template.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fields:</span>
                    <span className="font-medium">{template.fields.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sections:</span>
                    <span className="font-medium">{template.sections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Updated:</span>
                    <span className="font-medium">{format(template.updatedAt, 'MMM d')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleUseTemplate(template.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Use</span>
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEditTemplate(template.id)}
                      className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                      title="Edit Template"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicateTemplate(template)}
                      className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                      title="Duplicate Template"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template)}
                      className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-md transition-colors"
                      title="Delete Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterBy !== 'All Templates' || createdFilter !== 'All Dates'
                ? 'Try adjusting your search criteria or filters.' 
                : 'Create your first template to get started.'}
            </p>
            <button
              onClick={handleNewTemplate}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Template</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;