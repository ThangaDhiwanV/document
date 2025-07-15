import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Save, Eye, Settings } from 'lucide-react';
import { templatesApi } from '../../api/templates';
import { Template } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

const FormBuilder: React.FC = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  const loadTemplate = async () => {
    if (!templateId) return;
    
    try {
      setLoading(true);
      const templateData = await templatesApi.getTemplate(templateId);
      setTemplate(templateData);
      setFormTitle(templateData.name);
      // Load existing fields if any
      setFields([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'New Field',
      required: false,
      placeholder: ''
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const saveForm = async () => {
    try {
      setLoading(true);
      // Save form logic here
      console.log('Saving form:', { title: formTitle, fields });
      navigate('/templates');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save form');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <ErrorMessage message={error} onRetry={loadTemplate} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
              <p className="text-gray-600">Create and customize your forms</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/templates')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveForm}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 inline mr-2" />
                Save Form
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Form Title"
                className="w-full text-xl font-semibold border-none outline-none"
              />
            </div>

            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between mb-4">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      className="font-medium border-none outline-none"
                    />
                    <button
                      onClick={() => removeField(field.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={field.type}
                      onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                      className="border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="select">Select</option>
                      <option value="textarea">Textarea</option>
                    </select>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="mr-2"
                      />
                      Required
                    </label>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addField}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Add Field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormBuilder;