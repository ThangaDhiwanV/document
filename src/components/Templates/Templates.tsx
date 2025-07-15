import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Copy, Eye, FileText, Filter, SortAsc, SortDesc, AlertTriangle, CheckCircle } from 'lucide-react';
import { mockTemplates, getDocumentTypeDisplayName, mockUsers } from '../../data/mockData';
import { DocumentTemplate } from '../../types';
import { format } from 'date-fns';

const Templates: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
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
    const matchesType = filterType === 'all' || template.type === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'updated':
        aValue = new Date(a.updatedAt).getTime();
        bValue = new Date(b.updatedAt).getTime();
        break;
      case 'fields':
        aValue = a.fields.length;
        bValue = b.fields.length;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
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
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setSortBy('name');
    setSortOrder('asc');
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
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be undone.
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

        {/* Search and Filters */}
        <div className="flex items-center justify-between space-x-4">
          {/* Search */}
          <div className="relative min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Filters and Controls */}
          <div className="flex items-center space-x-3 text-sm">
            {/* Type Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 min-w-[140px]"
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

            {/* Sort */}
            <div className="flex items-center space-x-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 min-w-[100px]"
              >
                <option value="name">Name</option>
                <option value="type">Type</option>
                <option value="updated">Updated</option>
                <option value="fields">Fields</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? 
                  <SortAsc className="w-4 h-4 text-gray-500" /> : 
                  <SortDesc className="w-4 h-4 text-gray-500" />
                }
              </button>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Clear
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
              {searchTerm || filterType !== 'all'
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