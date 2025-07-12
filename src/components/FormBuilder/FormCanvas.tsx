import React from 'react';
import { useDrop } from 'react-dnd';
import { Trash2, Settings } from 'lucide-react';
import { FormField, DocumentSection } from '../../types';
import RichTextEditor from './RichTextEditor';
import ResizableField from './ResizableField';
import EditableTable from './EditableTable';

interface FormCanvasProps {
  fields: FormField[];
  sections: DocumentSection[];
  selectedField: FormField | null;
  uploadedDocument?: string | null;
  onSelectField: (field: FormField) => void;
  onPropertiesClick: (field: FormField) => void;
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void;
  onDeleteField: (fieldId: string) => void;
  onMoveField: (fieldId: string, newPosition: { x: number; y: number }) => void;
  onAddField: (fieldType: string, position?: { x: number; y: number }) => void;
}

const FormCanvas: React.FC<FormCanvasProps> = ({
  fields,
  sections,
  selectedField,
  uploadedDocument,
  onSelectField,
  onPropertiesClick,
  onUpdateField,
  onDeleteField,
  onMoveField,
  onAddField
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'fieldType',
    drop: (item: { fieldType: string }, monitor) => {
      const offset = monitor.getClientOffset();
      const canvasElement = document.getElementById('form-canvas');
      
      if (offset && canvasElement) {
        const canvasRect = canvasElement.getBoundingClientRect();
        const position = {
          x: Math.max(20, offset.x - canvasRect.left),
          y: Math.max(20, offset.y - canvasRect.top)
        };
        onAddField(item.fieldType, position);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  const renderFieldContent = (field: FormField) => {
    switch (field.type) {
      case 'rich_text':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <RichTextEditor
              value={field.defaultValue || ''}
              onChange={(value) => onUpdateField(field.id, { defaultValue: value })}
              placeholder="Enter rich text content..."
            />
          </div>
        );
      case 'text':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              placeholder={field.placeholder || 'Enter text...'}
              value={field.defaultValue || ''}
              onChange={(e) => onUpdateField(field.id, { defaultValue: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      case 'textarea':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              placeholder={field.placeholder || 'Enter text...'}
              value={field.defaultValue || ''}
              onChange={(e) => onUpdateField(field.id, { defaultValue: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      case 'number':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              placeholder={field.placeholder || 'Enter number...'}
              value={field.defaultValue || ''}
              onChange={(e) => onUpdateField(field.id, { defaultValue: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      case 'date':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="date"
              value={field.defaultValue || ''}
              onChange={(e) => onUpdateField(field.id, { defaultValue: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      case 'dropdown':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select 
              value={field.defaultValue || ''}
              onChange={(e) => onUpdateField(field.id, { defaultValue: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an option...</option>
              {field.options?.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              checked={field.defaultValue === 'true'}
              onChange={(e) => onUpdateField(field.id, { defaultValue: e.target.checked.toString() })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
            />
            <label className="text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
          </div>
        );
      case 'table':
        return (
          <EditableTable
            rows={field.tableData?.rows || []}
            columns={field.tableData?.columns || 3}
            onUpdateTable={(rows, columns) => 
              onUpdateField(field.id, { 
                tableData: { rows, columns } 
              })
            }
            label={field.label}
            required={field.required}
          />
        );
      case 'signature':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 text-sm">
              Signature will appear here
            </div>
          </div>
        );
      case 'file_upload':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="w-full h-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 text-sm">
              Click to upload or drag files here
            </div>
          </div>
        );
      default:
        return <div>Unknown field type</div>;
    }
  };

  const renderField = (field: FormField) => (
    <ResizableField
      key={field.id}
      field={field}
      isSelected={selectedField?.id === field.id}
      onUpdateField={(updates) => onUpdateField(field.id, updates)}
      onSelectField={onSelectField}
    >
      <div
        className={`p-3 border rounded-lg bg-white transition-all ${
          selectedField?.id === field.id
            ? 'ring-2 ring-blue-500 bg-blue-50'
            : 'hover:ring-1 hover:ring-gray-300'
        }`}
      >
        {renderFieldContent(field)}
        
        {/* Field Actions */}
        <div className="field-actions absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
          <div className="bg-white rounded shadow-sm border border-gray-200 flex">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPropertiesClick(field);
              }}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded-l"
              title="Edit Properties"
            >
              <Settings className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteField(field.id);
              }}
              className="p-1 text-red-600 hover:bg-red-50 rounded-r border-l border-gray-200"
              title="Delete Field"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </ResizableField>
  );

  const groupedFields = sections.map(section => ({
    ...section,
    sectionFields: fields.filter(field => field.section === section.id)
  }));

  // Calculate section height based on fields with auto-growth
  const calculateSectionHeight = (sectionFields: FormField[]) => {
    if (sectionFields.length === 0) return 200;
    
    let maxBottom = 200; // Minimum height
    sectionFields.forEach(field => {
      const fieldBottom = (field.position?.y || 0) + (field.size?.height || 40) + 40; // Add more padding
      if (fieldBottom > maxBottom) {
        maxBottom = fieldBottom;
      }
    });
    
    // Add extra space for new fields
    return Math.max(maxBottom + 60, 200);
  };

  return (
    <div 
      ref={drop}
      id="form-canvas"
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-full relative ${
        isOver ? 'bg-blue-50 border-blue-300 border-dashed' : ''
      }`}
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Form Preview</h2>
        <p className="text-gray-600">
          {isOver 
            ? 'Drop field here to add it to the form' 
            : 'Drag fields from the palette or click on fields to select them. Click the properties icon to edit field properties.'
          }
        </p>
        {uploadedDocument && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <strong>Base Document:</strong> {uploadedDocument}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Form fields will be overlaid on this document when exported.
            </p>
          </div>
        )}
      </div>
      
      {groupedFields.map((section) => {
        const sectionHeight = calculateSectionHeight(section.sectionFields);
        
        return (
          <div key={section.id} className="mb-8 relative">
            <div className="border-b border-gray-200 pb-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
            </div>
            
            <div 
              className="relative border-2 border-dashed border-gray-200 rounded-lg p-4 transition-all duration-300"
              style={{ 
                minHeight: `${sectionHeight}px`,
                height: `${sectionHeight}px`
              }}
            >
              {section.sectionFields.map(renderField)}
              
              {section.sectionFields.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 pointer-events-none">
                  <div className="text-center">
                    <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No fields in this section. Drag fields from the palette to get started.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {fields.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Settings className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Form</h3>
          <p className="text-gray-600">
            Drag field types from the palette on the left to begin creating your document template.
          </p>
        </div>
      )}
    </div>
  );
};

export default FormCanvas;