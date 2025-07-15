import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Save, Eye, Settings, Plus, Upload, CheckCircle, X, ChevronLeft, ChevronRight, Pin, PinOff } from 'lucide-react';
import FieldPalette from './FieldPalette';
import FormCanvas from './FormCanvas';
import PropertyPanel from './PropertyPanel';
import FormPreview from './FormPreview';
import { FormField, DocumentSection, Document } from '../../types';
import { mockTemplates, mockDocuments } from '../../data/mockData';

const FormBuilder: React.FC = () => {
  const { templateId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode');
  const isCreateDocument = mode === 'create-document';
  const isEditTemplate = mode === 'edit-template';
  const isNewTemplate = mode === 'template';
  
  const [fields, setFields] = useState<FormField[]>([]);
  const [sections, setSections] = useState<DocumentSection[]>([
    { id: 'default', name: 'General Information', order: 1, fields: [] }
  ]);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [formName, setFormName] = useState('Untitled Form');
  const [documentType, setDocumentType] = useState('test_method');
  const [showPreview, setShowPreview] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Properties panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isPanelDocked, setIsPanelDocked] = useState(false);

  // Load template data if editing existing template
  useEffect(() => {
    if (templateId && isEditTemplate) {
      // Edit existing template
      const template = mockTemplates.find(t => t.id === templateId);
      if (template) {
        setFormName(template.name);
        setDocumentType(template.type);
        setFields(template.fields);
        setSections(template.sections);
      }
    } else if (templateId && isCreateDocument) {
      // Create document from template
      const template = mockTemplates.find(t => t.id === templateId);
      if (template) {
        setFormName(`New ${template.name}`);
        setDocumentType(template.type);
        // Keep original field IDs for data mapping, but clear default values for user input
        setFields(template.fields.map(field => ({ ...field, defaultValue: '' })));
        setSections(template.sections);
      }
    } else if (isNewTemplate) {
      // Create new template from scratch
      setFormName('New Template');
      setDocumentType('test_method');
      setFields([]);
      setSections([{ id: 'default', name: 'General Information', order: 1, fields: [] }]);
    }

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const addField = (fieldType: string, position?: { x: number; y: number }) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: fieldType as FormField['type'],
      label: `New ${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
      required: fieldType !== 'rich_text',
      section: 'default',
      position: position || { x: 20 + fields.length * 10, y: 20 + fields.length * 10 },
      size: { width: 300, height: fieldType === 'textarea' ? 100 : fieldType === 'table' ? 200 : 40 }
    };
    
    if (fieldType === 'table') {
      newField.tableData = {
        rows: [
          {
            id: 'row-1',
            cells: [
              { id: 'cell-1-1', content: 'Parameter', style: { backgroundColor: '#f9fafb', fontWeight: 'bold', textAlign: 'left', borderColor: '#d1d5db', borderWidth: 1 } },
              { id: 'cell-1-2', content: 'Specification', style: { backgroundColor: '#f9fafb', fontWeight: 'bold', textAlign: 'left', borderColor: '#d1d5db', borderWidth: 1 } },
              { id: 'cell-1-3', content: 'Result', style: { backgroundColor: '#f9fafb', fontWeight: 'bold', textAlign: 'left', borderColor: '#d1d5db', borderWidth: 1 } }
            ]
          }
        ],
        columns: 3
      };
    }
    
    setFields([...fields, newField]);
    setSelectedField(newField);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
    
    if (selectedField?.id === fieldId) {
      setSelectedField({ ...selectedField, ...updates });
    }
  };

  const deleteField = (fieldId: string) => {
    setFields(fields.filter(field => field.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
      setIsPanelOpen(false);
    }
  };

  const moveField = (fieldId: string, newPosition: { x: number; y: number }) => {
    updateField(fieldId, { position: newPosition });
  };

  const addSection = () => {
    const newSection: DocumentSection = {
      id: `section-${Date.now()}`,
      name: `Section ${sections.length + 1}`,
      order: sections.length + 1,
      fields: []
    };
    setSections([...sections, newSection]);
  };

  const handleUploadDocument = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setUploadedDocument(file.name);
        showNotification(`Document "${file.name}" uploaded successfully! You can now add signature fields and other form elements on top of it.`, 'success');
      }
    };
    input.click();
  };

  const saveForm = async () => {
    let finalFormName = formName;

    // Prompt for name based on what we're creating/editing
    if (isCreateDocument) {
      const userProvidedName = prompt('Enter a name for this document:', formName);
      if (!userProvidedName || !userProvidedName.trim()) {
        return; // User cancelled or provided empty name
      }
      finalFormName = userProvidedName.trim();
      setFormName(finalFormName);
    } else if (isNewTemplate) {
      const userProvidedName = prompt('Enter a name for this template:', formName);
      if (!userProvidedName || !userProvidedName.trim()) {
        return; // User cancelled or provided empty name
      }
      finalFormName = userProvidedName.trim();
      setFormName(finalFormName);
    }

    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (isNewTemplate || isEditTemplate) {
        // Create new template
        const newTemplate = {
          id: isEditTemplate ? templateId : `tmp-${Date.now()}`,
          name: finalFormName,
          type: documentType as any,
          version: '1.0',
          fields: fields,
          sections: sections,
          createdBy: '1', // Current user
          createdAt: isEditTemplate ? mockTemplates.find(t => t.id === templateId)?.createdAt || new Date() : new Date(),
          updatedAt: new Date(),
          isActive: true
        };

        if (isEditTemplate) {
          // Update existing template
          const index = mockTemplates.findIndex(t => t.id === templateId);
          if (index !== -1) {
            mockTemplates[index] = newTemplate;
          }
        } else {
          // Add new template
          mockTemplates.push(newTemplate);
        }

        console.log('Saving form as template:', newTemplate);
        showNotification(isEditTemplate ? 'Template updated successfully!' : 'Template saved successfully!', 'success');

        // Navigate to templates list after successful save
        setTimeout(() => {
          navigate('/templates');
        }, 1500);
      } else if (isCreateDocument) {
        // Create new document from template
        const newDocument: Document = {
          id: `doc-${Date.now()}`,
          templateId: templateId || `template-${Date.now()}`,
          name: finalFormName,
          type: documentType as any,
          status: 'draft',
          version: '1.0',
          data: fields.reduce((acc, field) => {
            acc[field.id] = field.defaultValue || '';
            return acc;
          }, {} as Record<string, any>),
          signatures: [],
          auditTrail: [
            {
              id: `audit-${Date.now()}`,
              action: 'Document Created from Template',
              userId: '1', // Current user
              timestamp: new Date(),
              details: `Document created from template: ${mockTemplates.find(t => t.id === templateId)?.name}`,
              ipAddress: '192.168.1.100'
            }
          ],
          createdBy: '1', // Current user
          createdAt: new Date(),
          updatedAt: new Date(),
          assignedTo: []
        };

        // Add to mock documents (in real app, this would be an API call)
        mockDocuments.push(newDocument);

        console.log('Saving form as document:', newDocument);
        showNotification('Document created successfully!', 'success');

        // Navigate to documents list after successful save
        setTimeout(() => {
          navigate('/documents');
        }, 1500);
      }

    } catch (error) {
      console.error('Error saving form:', error);
      showNotification('Error saving form. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const previewForm = () => {
    setShowPreview(true);
  };

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const toggleDock = () => {
    setIsPanelDocked(!isPanelDocked);
    if (!isPanelDocked) {
      setIsPanelOpen(true);
    }
  };

  // Handle field selection (for visual selection only, not panel opening)
  const handleFieldSelect = (field: FormField) => {
    setSelectedField(field);
  };

  // Handle properties icon click (opens panel)
  const handlePropertiesClick = (field: FormField) => {
    setSelectedField(field);
    if (!isPanelDocked) {
      setIsPanelOpen(true);
    }
  };

  if (showPreview) {
    return (
      <FormPreview
        formName={formName}
        documentType={documentType}
        fields={fields}
        sections={sections}
        uploadedDocument={uploadedDocument}
        onClose={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-20 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 ${
            notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
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

        {/* Fixed Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 fixed top-16 left-16 right-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className={`text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 ${
                  isCreateDocument ? 'text-green-700' : isEditTemplate ? 'text-blue-700' : 'text-gray-900'
                }`}
                placeholder={isCreateDocument ? 'Enter document name...' : isNewTemplate ? 'Enter template name...' : 'Form name'}
              />
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className={`px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 ${
                  isEditTemplate ? 'bg-gray-100' : ''
                }`}
                disabled={isEditTemplate}
              >
                <option value="test_method">Test Method</option>
                <option value="sop">SOP</option>
                <option value="coa">Certificate of Analysis</option>
                <option value="specification">Specification</option>
                <option value="protocol">Protocol</option>
                <option value="report">Report</option>
              </select>
              {isCreateDocument && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm">
                  <FileText className="w-4 h-4" />
                  <span>Creating Document</span>
                </div>
              )}
              {isEditTemplate && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                  <Settings className="w-4 h-4" />
                  <span>Editing Template</span>
                </div>
              )}
              {isNewTemplate && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-md text-sm">
                  <Plus className="w-4 h-4" />
                  <span>New Template</span>
                </div>
              )}
              {uploadedDocument && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm">
                  <Upload className="w-4 h-4" />
                  <span>{uploadedDocument}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Properties Panel Toggle */}
              {selectedField && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleDock}
                    className={`p-2 rounded-lg transition-colors ${
                      isPanelDocked ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title={isPanelDocked ? 'Undock Panel' : 'Dock Panel'}
                  >
                    {isPanelDocked ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={togglePanel}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Properties</span>
                    {isPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </button>
                </div>
              )}
              
              <button
                onClick={previewForm}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
              <button
                onClick={saveForm}
                disabled={isSaving}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isSaving 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                <span>
                  {isSaving 
                    ? 'Saving...' 
                    : isCreateDocument 
                      ? 'Create Document' 
                      : isEditTemplate 
                        ? 'Update Template' 
                        : 'Save Template'
                  }
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Fixed height container */}
        <div className="flex-1 flex pt-16 h-screen overflow-hidden">
          {/* Field Palette - Fixed width with independent scroll */}
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <div className="p-3">
                <FieldPalette 
                  onAddField={addField} 
                  onUploadDocument={handleUploadDocument}
                />
                
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Sections</h3>
                    <button
                      onClick={addSection}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {sections.map((section) => (
                      <div
                        key={section.id}
                        className="p-2 bg-gray-50 rounded-md text-sm text-gray-700"
                      >
                        {section.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Canvas - Flexible width with independent scroll */}
          <div 
            className={`flex-1 flex flex-col h-full transition-all duration-300 ${
              isPanelDocked && isPanelOpen ? 'mr-80' : ''
            }`}
          >
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <FormCanvas
                  fields={fields}
                  sections={sections}
                  selectedField={selectedField}
                  uploadedDocument={uploadedDocument}
                  onSelectField={handleFieldSelect}
                  onPropertiesClick={handlePropertiesClick}
                  onUpdateField={updateField}
                  onDeleteField={deleteField}
                  onMoveField={moveField}
                  onAddField={addField}
                />
              </div>
            </div>
          </div>

          {/* Slide-out Properties Panel */}
          {selectedField && (
            <>
              {/* Backdrop for non-docked panel */}
              {!isPanelDocked && isPanelOpen && (
                <div 
                  className="fixed inset-0 bg-black bg-opacity-25 z-40"
                  onClick={() => setIsPanelOpen(false)}
                />
              )}
              
              {/* Properties Panel with independent scroll */}
              <div 
                className={`${
                  isPanelDocked 
                    ? 'fixed right-0 top-20 bottom-0 w-80 bg-white border-l border-gray-200 z-30' 
                    : 'fixed right-0 top-0 bottom-0 w-80 bg-white shadow-xl z-50'
                } transform transition-transform duration-300 ease-in-out ${
                  isPanelOpen ? 'translate-x-0' : 'translate-x-full'
                } flex flex-col h-full`}
              >
                {/* Panel Header */}
                <div className={`flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0 ${
                  isPanelDocked ? 'bg-gray-50' : 'bg-white'
                }`}>
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Properties</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleDock}
                      className={`p-2 rounded-lg transition-colors ${
                        isPanelDocked ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title={isPanelDocked ? 'Undock Panel' : 'Dock Panel'}
                    >
                      {isPanelDocked ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setIsPanelOpen(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Panel Content with independent scroll */}
                <div className="flex-1 overflow-y-auto">
                  <PropertyPanel
                    field={selectedField}
                    onUpdateField={(updates) => updateField(selectedField.id, updates)}
                    sections={sections}
                  />
                </div>
              </div>
            </>
          )}
        </div>
    </div>
  );
};

export default FormBuilder;