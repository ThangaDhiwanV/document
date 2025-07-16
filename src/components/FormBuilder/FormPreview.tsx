import React, { useState } from 'react';
import { X, Download, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { FormField, DocumentSection } from '../../types';
import RichTextEditor from './RichTextEditor';
import { generateDocumentPDF } from '../../utils/pdfGenerator';
import { mockUsers } from '../../data/mockData';

interface FormPreviewProps {
  formName: string;
  documentType: string;
  fields: FormField[];
  sections: DocumentSection[];
  uploadedDocument?: string | null;
  onClose: () => void;
}

const FormPreview: React.FC<FormPreviewProps> = ({
  formName,
  documentType,
  fields,
  sections,
  uploadedDocument,
  onClose
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    // Initialize form data with default values from fields
    const initialData: Record<string, any> = {};
    fields.forEach(field => {
      initialData[field.id] = field.defaultValue || '';
    });
    return initialData;
  });
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const updateFormData = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    
    try {
      // Create a mock document for PDF generation
      const mockDocument = {
        id: 'preview-doc',
        templateId: 'preview-template',
        name: formName,
        type: documentType as any,
        status: 'draft' as any,
        version: '1.0',
        data: formData,
        signatures: [],
        auditTrail: [
          {
            id: 'audit-preview',
            action: 'Document Preview Generated',
            userId: '1',
            timestamp: new Date(),
            details: 'PDF preview generated from form builder',
            ipAddress: '192.168.1.100'
          }
        ],
        createdBy: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedTo: []
      };

      await generateDocumentPDF(mockDocument, mockUsers, {
        includeAuditTrail: false,
        includeSignatures: false,
        watermark: 'PREVIEW'
      });
      
      showNotification('PDF exported successfully!', 'success');
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showNotification('Error exporting PDF. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'rich_text':
        return (
          <div className="mb-6">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: formData[field.id] || field.defaultValue || field.label }}
            />
          </div>
        );
      case 'text':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              placeholder={field.placeholder}
              value={formData[field.id] || ''}
              onChange={(e) => updateFormData(field.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      case 'textarea':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              placeholder={field.placeholder}
              value={formData[field.id] || ''}
              onChange={(e) => updateFormData(field.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      case 'number':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              placeholder={field.placeholder}
              value={formData[field.id] || ''}
              onChange={(e) => updateFormData(field.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      case 'date':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="date"
              value={formData[field.id] || ''}
              onChange={(e) => updateFormData(field.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      case 'dropdown':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <select 
              value={formData[field.id] || ''}
              onChange={(e) => updateFormData(field.id, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="mb-4 flex items-center space-x-2">
            <input 
              type="checkbox" 
              checked={formData[field.id] === 'true' || formData[field.id] === true}
              onChange={(e) => updateFormData(field.id, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
            />
            <label className="text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
          </div>
        );
      case 'table':
        return (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  {field.tableData?.rows.map((row, rowIndex) => (
                    <tr key={row.id}>
                      {row.cells.map((cell, cellIndex) => (
                        <td 
                          key={cell.id} 
                          className="px-4 py-2"
                          style={{
                            backgroundColor: cell.style.backgroundColor,
                            textAlign: cell.style.textAlign,
                            fontWeight: cell.style.fontWeight,
                            fontStyle: cell.style.fontStyle,
                            borderColor: cell.style.borderColor,
                            borderWidth: cell.style.borderWidth,
                            borderStyle: 'solid'
                          }}
                        >
                          {cell.content || (rowIndex === 0 ? `Header ${cellIndex + 1}` : `Cell ${rowIndex + 1}-${cellIndex + 1}`)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'signature':
        return (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 text-sm bg-gray-50">
              Click here to sign digitally
            </div>
          </div>
        );
      case 'file_upload':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="w-full h-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 text-sm bg-gray-50">
              Click to upload or drag files here
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const groupedFields = sections.map(section => ({
    ...section,
    sectionFields: fields.filter(field => field.section === section.id)
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
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
            <button
              onClick={() => setNotification(null)}
              className="ml-2 hover:bg-white hover:bg-opacity-20 rounded p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{formName}</h2>
              <p className="text-sm text-gray-600">{documentType.replace('_', ' ').toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isExporting 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-spin' : ''}`} />
              <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {uploadedDocument && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Base Document: {uploadedDocument}</p>
                  <p className="text-sm text-blue-700">Form fields will be overlaid on this document</p>
                </div>
              </div>
            </div>
          )}

          {groupedFields.map((section) => (
            <div key={section.id} className="mb-8">
              <div className="border-b border-gray-200 pb-2 mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
              </div>
              
              <div className="space-y-4">
                {section.sectionFields.map(renderField)}
              </div>
              
              {section.sectionFields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No fields in this section.
                </div>
              )}
            </div>
          ))}
          
          {fields.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FileText className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Fields Added</h3>
              <p className="text-gray-600">
                Add fields to your form to see the preview.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormPreview;