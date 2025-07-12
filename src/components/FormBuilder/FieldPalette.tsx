import React from 'react';
import { useDrag } from 'react-dnd';
import { 
  Type, 
  Hash, 
  Calendar, 
  ChevronDown, 
  CheckSquare, 
  AlignLeft,
  PenTool,
  Upload,
  FileText,
  Table,
  FolderOpen
} from 'lucide-react';

interface FieldPaletteProps {
  onAddField: (fieldType: string) => void;
  onUploadDocument: () => void;
}

interface DraggableFieldTypeProps {
  fieldType: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  onAddField: (fieldType: string) => void;
}

const DraggableFieldType: React.FC<DraggableFieldTypeProps> = ({ 
  fieldType, 
  label, 
  icon: Icon, 
  description, 
  onAddField 
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'fieldType',
    item: { fieldType },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  return (
    <button
      ref={drag}
      onClick={() => onAddField(fieldType)}
      className={`w-full flex items-start space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </button>
  );
};

const FieldPalette: React.FC<FieldPaletteProps> = ({ onAddField, onUploadDocument }) => {
  const fieldTypes = [
    { type: 'rich_text', label: 'Rich Text', icon: FileText, description: 'Formatted text content' },
    { type: 'text', label: 'Text Input', icon: Type, description: 'Single line text' },
    { type: 'textarea', label: 'Text Area', icon: AlignLeft, description: 'Multi-line text' },
    { type: 'number', label: 'Number', icon: Hash, description: 'Numeric input' },
    { type: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
    { type: 'dropdown', label: 'Dropdown', icon: ChevronDown, description: 'Select options' },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, description: 'Yes/No options' },
    { type: 'table', label: 'Table', icon: Table, description: 'Data table' },
    { type: 'signature', label: 'Signature', icon: PenTool, description: 'Digital signature' },
    { type: 'file_upload', label: 'File Upload', icon: Upload, description: 'File attachment' }
  ];

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Field Types</h3>
      <div className="space-y-2">
        {fieldTypes.map((field) => (
          <DraggableFieldType
            key={field.type}
            fieldType={field.type}
            label={field.label}
            icon={field.icon}
            description={field.description}
            onAddField={onAddField}
          />
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Document Upload</h3>
        <button
          onClick={onUploadDocument}
          className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
        >
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FolderOpen className="w-4 h-4 text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">Upload Document</p>
            <p className="text-xs text-gray-500">Add fields to existing document</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default FieldPalette;