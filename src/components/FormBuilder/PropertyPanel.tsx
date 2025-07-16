import React from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { FormField, DocumentSection } from '../../types';
import RichTextEditor from './RichTextEditor';

interface PropertyPanelProps {
  field: FormField;
  onUpdateField: (updates: Partial<FormField>) => void;
  sections: DocumentSection[];
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ 
  field, 
  onUpdateField, 
  sections 
}) => {
  const [localValue, setLocalValue] = React.useState(field.defaultValue || '');

  React.useEffect(() => {
    setLocalValue(field.defaultValue || '');
  }, [field.id, field.defaultValue]);

  const handleValueChange = (value: string) => {
    setLocalValue(value);
    onUpdateField({ defaultValue: value });
  };

  const updateOptions = (newOptions: string[]) => {
    onUpdateField({ options: newOptions });
  };

  const addOption = () => {
    const currentOptions = field.options || [];
    updateOptions([...currentOptions, `Option ${currentOptions.length + 1}`]);
  };

  const updateOption = (index: number, value: string) => {
    const currentOptions = field.options || [];
    const newOptions = [...currentOptions];
    newOptions[index] = value;
    updateOptions(newOptions);
  };

  const removeOption = (index: number) => {
    const currentOptions = field.options || [];
    updateOptions(currentOptions.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Field Properties</h3>
      </div>

      <div className="space-y-6">
        {/* Basic Properties */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Field Label
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => onUpdateField({ label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {field.type !== 'rich_text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placeholder Text
            </label>
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => onUpdateField({ placeholder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Rich Text Content */}
        {field.type === 'rich_text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <div className="border border-gray-300 rounded-md">
              <RichTextEditor
                key={field.id}
                value={localValue || field.label || ''}
                onChange={handleValueChange}
                placeholder="Enter your rich text content..."
              />
            </div>
          </div>
        )}

        {/* Default Value for other field types */}
        {field.type !== 'rich_text' && field.type !== 'signature' && field.type !== 'file_upload' && field.type !== 'table' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Value
            </label>
            {field.type === 'textarea' ? (
              <textarea
                value={localValue}
                onChange={(e) => handleValueChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                placeholder="Enter default value..."
              />
            ) : field.type === 'dropdown' ? (
              <select
                value={localValue}
                onChange={(e) => handleValueChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select default option...</option>
                {(field.options || []).map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            ) : field.type === 'checkbox' ? (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={localValue === 'true' || localValue === true}
                  onChange={(e) => handleValueChange(e.target.checked.toString())}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Default checked</label>
              </div>
            ) : (
              <input
                type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                value={localValue}
                onChange={(e) => handleValueChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter default value..."
              />
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section
          </label>
          <select
            value={field.section || 'default'}
            onChange={(e) => onUpdateField({ section: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>

        {field.type !== 'rich_text' && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="required"
              checked={field.required}
              onChange={(e) => onUpdateField({ required: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="required" className="ml-2 block text-sm text-gray-900">
              Required field
            </label>
          </div>
        )}

        {/* Field Type Specific Properties */}
        {(field.type === 'dropdown' || field.type === 'checkbox') && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Options
              </label>
              <button
                onClick={addOption}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4" />
                <span>Add Option</span>
              </button>
            </div>
            
            <div className="space-y-2">
              {(field.options || []).map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    onClick={() => removeOption(index)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    title="Remove option"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(field.options || []).length === 0 && (
                <p className="text-sm text-gray-500 italic">No options added yet. Click "Add Option" to get started.</p>
              )}
            </div>
          </div>
        )}

        {field.type === 'number' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Value
              </label>
              <input
                type="number"
                value={field.validation?.min || ''}
                onChange={(e) => onUpdateField({ 
                  validation: { ...field.validation, min: parseFloat(e.target.value) || undefined }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Value
              </label>
              <input
                type="number"
                value={field.validation?.max || ''}
                onChange={(e) => onUpdateField({ 
                  validation: { ...field.validation, max: parseFloat(e.target.value) || undefined }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {field.type === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Validation Pattern (Regex)
            </label>
            <input
              type="text"
              value={field.validation?.pattern || ''}
              onChange={(e) => onUpdateField({ 
                validation: { ...field.validation, pattern: e.target.value }
              })}
              placeholder="e.g., ^[A-Z]{2,3}-\d{4}$"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Validation Error Message
          </label>
          <textarea
            value={field.validation?.message || ''}
            onChange={(e) => onUpdateField({ 
              validation: { ...field.validation, message: e.target.value }
            })}
            placeholder="Custom error message for validation failures"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;