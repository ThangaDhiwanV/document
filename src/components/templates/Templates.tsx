import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Copy, Eye, FileText, Filter, SortAsc, SortDesc, AlertTriangle, CheckCircle, Users, Calendar } from 'lucide-react';
import { DocumentTemplate } from '../../types';
import { format } from 'date-fns';
import { templatesApi } from '../../api/templates';
import { dropdownsApi } from '../../api/dropdowns';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import SearchInput from '../common/SearchInput';
import Dropdown from '../common/Dropdown';

const Templates: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState('None');
  const [filterBy, setFilterBy] = useState('All Templates');
  const [sortBy, setSortBy] = useState('Name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [createdFilter, setCreatedFilter] = useState('All Dates');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Dropdown options
  const [groupByOptions, setGroupByOptions] = useState([]);
  const [filterOptions, setFilterOptions] = useState([]);
  const [sortOptions, setSortOptions] = useState([]);
  const [dateOptions, setDateOptions] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [templatesResponse, groupByResponse, filterResponse, sortResponse, dateResponse] = await Promise.all([
        templatesApi.getTemplates(),
        dropdownsApi.getGroupByOptions(),
        dropdownsApi.getDocumentStatuses(),
        dropdownsApi.getSortOptions(),
        dropdownsApi.getDateFilterOptions()
      ]);
      
      setTemplates(templatesResponse || []);
      setGroupByOptions(groupByResponse || []);
      setFilterOptions([{ value: 'All Templates', label: 'All Templates' }, ...(filterResponse || [])]);
      setSortOptions(sortResponse || []);
      setDateOptions(dateResponse || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleNewTemplate = () => {
    navigate('/builder');
  };

  const handleEditTemplate = (templateId: string) => {
    navigate(`/builder/${templateId}`);
  };

  const handleUseTemplate = (templateId: string) => {
    navigate(`/builder/${templateId}?mode=create`);
  };

  const handleDeleteTemplate = async (template: DocumentTemplate) => {
    try {
      await templatesApi.deleteTemplate(template.id);
      setTemplates(prev => prev.filter(t => t.id !== template.id));
      showNotification(`Template "${template.name}" has been deleted successfully.`, 'success');
    } catch (error) {
      showNotification('Error deleting template. Please try again.', 'error');
    }
  };

  const handleDuplicateTemplate = async (template: DocumentTemplate) => {
    try {
      const newTemplate = {
        ...template,
        name: `${template.name} - Copy`,
        version: '1.0',
        fields: template.fields.map(field => ({
          ...field,
          id: `field-${Date.now()}-${Math.random()}`
        }))
      };
      
      const createdTemplate = await templatesApi.createTemplate(newTemplate);
      setTemplates(prev => [createdTemplate, ...prev]);
      showNotification(`Template "${template.name}" has been duplicated successfully.`, 'success');
    } catch (error) {
      showNotification('Error duplicating template. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadData} />;
  }

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

      {/* Header */}
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {templates.map((template) => (
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
                        {template.type.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Templates;