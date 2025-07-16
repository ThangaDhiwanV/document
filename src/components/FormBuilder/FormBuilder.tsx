import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Save, Eye, Settings, Plus, Upload, CheckCircle, X, ChevronLeft, ChevronRight, Pin, PinOff, FileText, Copy, Trash2, RotateCcw, Layers, Grid, List, Zap, Lock, Unlock } from 'lucide-react';
import FieldPalette from './FieldPalette';
import FormCanvas from './FormCanvas';
import PropertyPanel from './PropertyPanel';
import FormPreview from './FormPreview';
import { FormField, DocumentSection, Document } from '../../types';
import { mockTemplates } from '../../data/mockData';
import { mockDocuments } from '../../mock/documents';
import { format } from 'date-fns';

const FormBuilder: React.FC = () => {
  const { templateId, documentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode');
  const isCreateDocument = mode === 'create-document';
  const isEditTemplate = mode === 'edit-template';
  const isEditDocument = mode === 'edit-document';
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
  const [isLocked, setIsLocked] = useState(false);
  const [viewMode, setViewMode] = useState<'canvas' | 'grid' | 'list'>('canvas');
  const [zoom, setZoom] = useState(100);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string; type: 'field' | 'section' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<() => void>(() => {});
  
  // Properties panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isPanelDocked, setIsPanelDocked] = useState(false);

  // Load template data based on mode
  useEffect(() => {
    if (isEditDocument && (templateId || documentId)) {
      // Edit existing document
      const docId = documentId || templateId;
      const document = mockDocuments.find(d => d.id === docId);
      if (document) {
        setFormName(document.name);
        setDocumentType(document.type);
        setIsLocked(false);
        
        // Find the template to get field structure
        const template = mockTemplates.find(t => t.id === document.templateId);
        if (template) {
          // Load template fields with document data
          const fieldsWithData = template.fields.map(field => ({
            ...field,
            defaultValue: document.data[field.id] || field.defaultValue || ''
          }));
          setFields(fieldsWithData);
          setSections(template.sections);
        } else {
          console.error('Template not found for document:', document.templateId);
          showNotification('Template not found for this document', 'error');
        }
      } else {
        console.error('Document not found:', docId);
        showNotification('Document not found', 'error');
      }
    } else if (isNewTemplate) {
      // Create new template from scratch
      setFormName('New Template');
      setDocumentType('test_method');
      setFields([]);
      setSections([{ id: 'default', name: 'General Information', order: 1, fields: [] }]);
      setIsLocked(false);
    } else if (templateId && !isNewTemplate) {
      const template = mockTemplates.find(t => t.id === templateId);
      if (template) {
        if (isEditTemplate) {
          // Edit existing template - keep all data
          setFormName(template.name);
          setDocumentType(template.type);
          setFields(template.fields);
          setSections(template.sections);
          setIsLocked(false);
        } else if (isCreateDocument) {
          // Create document from template - full editing capabilities
          setFormName(`New ${template.name.replace('Template', 'Document')}`);
          setDocumentType(template.type);
          setFields(template.fields.map(field => ({ 
            ...field, 
            defaultValue: field.defaultValue || '' 
          })));
          setSections(template.sections);
          setIsLocked(false);
        }
      } else {
        console.error('Template not found:', templateId);
        showNotification('Template not found', 'error');
      }
    }
  }, [templateId, documentId, mode, isEditTemplate, isCreateDocument, isEditDocument, isNewTemplate]);

  // Save to history for undo/redo
  const saveToHistory = () => {
    const state = { fields, sections, formName, documentType };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setFields(prevState.fields);
      setSections(prevState.sections);
      setFormName(prevState.formName);
      setDocumentType(prevState.documentType);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setFields(nextState.fields);
      setSections(nextState.sections);
      setFormName(nextState.formName);
      setDocumentType(nextState.documentType);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const addField = (fieldType: string, position?: { x: number; y: number }) => {
    if (isLocked) {
      showNotification('Form is locked. Unlock to make changes.', 'error');
      return;
    }

    saveToHistory();
    
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
    if (isLocked) {
      showNotification('Form is locked. Unlock to make changes.', 'error');
      return;
    }

    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
    
    if (selectedField?.id === fieldId) {
      setSelectedField({ ...selectedField, ...updates });
    }
  };

  const handleDeleteField = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      setItemToDelete({ id: fieldId, name: field.label, type: 'field' });
      setConfirmDelete(() => () => {
        deleteField(fieldId);
        setDeleteModalOpen(false);
        setItemToDelete(null);
      });
      setDeleteModalOpen(true);
    }
  };

  const deleteField = (fieldId: string) => {
    if (isLocked) {
      showNotification('Form is locked. Unlock to make changes.', 'error');
      return;
    }

    saveToHistory();
    setFields(fields.filter(field => field.id !== fieldId));
    setSelectedField(null);
  };

  const duplicateField = (fieldId: string) => {
    if (isLocked) {
      showNotification('Form is locked. Unlock to make changes.', 'error');
      return;
    }

    const fieldToDuplicate = fields.find(f => f.id === fieldId);
    if (fieldToDuplicate) {
      saveToHistory();
      const newField = {
        ...fieldToDuplicate,
        id: `field-${Date.now()}`,
        label: `${fieldToDuplicate.label} (Copy)`,
        position: {
          x: (fieldToDuplicate.position?.x || 0) + 20,
          y: (fieldToDuplicate.position?.y || 0) + 20
        }
      };
      setFields([...fields, newField]);
      showNotification('Field duplicated successfully', 'success');
    }
  };

  const moveField = (fieldId: string, newPosition: { x: number; y: number }) => {
    if (isLocked) return;
    updateField(fieldId, { position: newPosition });
  };

  const addSection = () => {
    if (isLocked) {
      showNotification('Form is locked. Unlock to make changes.', 'error');
      return;
    }

    saveToHistory();
    const newSection: DocumentSection = {
      id: `section-${Date.now()}`,
      name: `Section ${sections.length + 1}`,
      order: sections.length + 1,
      fields: []
    };
    setSections([...sections, newSection]);
  };

  const handleDeleteSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      setItemToDelete({ id: sectionId, name: section.name, type: 'section' });
      setConfirmDelete(() => () => {
        deleteSection(sectionId);
        setDeleteModalOpen(false);
        setItemToDelete(null);
      });
      setDeleteModalOpen(true);
    }
  };

  const updateSection = (sectionId: string, updates: Partial<DocumentSection>) => {
    if (isLocked) {
      showNotification('Form is locked. Unlock to make changes.', 'error');
      return;
    }

    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const deleteSection = (sectionId: string) => {
    if (isLocked) {
      showNotification('Form is locked. Unlock to make changes.', 'error');
      return;
    }

    if (sections.length <= 1) {
      showNotification('Cannot delete the last section', 'error');
      return;
    }

    saveToHistory();
    // Move fields from deleted section to default section
    const fieldsInSection = fields.filter(f => f.section === sectionId);
    setFields(fields.map(f => 
      f.section === sectionId ? { ...f, section: 'default' } : f
    ));
    setSections(sections.filter(s => s.id !== sectionId));
    showNotification('Section deleted and fields moved to General Information', 'success');
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

  const clearForm = () => {
    if (isLocked) {
      showNotification('Form is locked. Unlock to make changes.', 'error');
      return;
    }

    if (confirm('Are you sure you want to clear all fields? This action cannot be undone.')) {
      saveToHistory();
      setFields([]);
      setSelectedField(null);
      setIsPanelOpen(false);
      showNotification('Form cleared successfully', 'success');
    }
  };

  const saveForm = async () => {
    // Use the current form name directly - no external prompts
    let finalFormName = formName.trim();
    
    // Generate default names if needed
    if (!finalFormName || finalFormName === 'Untitled Form') {
      if (isCreateDocument) {
        finalFormName = `New Document - ${format(new Date(), 'MMM d, yyyy HH:mm')}`;
      } else if (isNewTemplate) {
        finalFormName = `New Template - ${format(new Date(), 'MMM d, yyyy HH:mm')}`;
      } else {
        finalFormName = formName || 'Untitled';
      }
      setFormName(finalFormName);
    }
    
    // Auto-generate names for generic titles
    if (isCreateDocument && formName.includes('New ') && formName.includes('Template')) {
      finalFormName = formName.replace('Template', 'Document');
      setFormName(finalFormName);
    }

    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (isEditDocument) {
        // Update existing document
        const docId = documentId || templateId;
        const documentIndex = mockDocuments.findIndex(d => d.id === docId);
        if (documentIndex !== -1) {
          mockDocuments[documentIndex] = {
            ...mockDocuments[documentIndex],
            name: finalFormName,
            data: fields.reduce((acc, field) => {
              acc[field.id] = field.defaultValue || '';
              return acc;
            }, {} as Record<string, any>),
            updatedAt: new Date()
          };
          
          showNotification('Document updated and saved successfully!', 'success');
        }
      } else if (isNewTemplate || isEditTemplate) {
        // Create or update template
        const templateData = {
          id: isEditTemplate ? templateId : `tmp-${Date.now()}`,
          name: finalFormName,
          type: documentType as any,
          version: isEditTemplate ? (mockTemplates.find(t => t.id === templateId)?.version || '1.0') : '1.0',
          fields: fields,
          sections: sections,
          createdBy: '1', // Current user
          createdAt: isEditTemplate ? (mockTemplates.find(t => t.id === templateId)?.createdAt || new Date()) : new Date(),
          updatedAt: new Date(),
          isActive: true
        };

        if (isEditTemplate) {
          // Update existing template
          const index = mockTemplates.findIndex(t => t.id === templateId);
          if (index !== -1) {
            mockTemplates[index] = templateData;
          }
        } else {
          // Add new template
          mockTemplates.push(templateData);
        }

        showNotification(
          isEditTemplate ? 'Template updated and saved successfully!' : 'Template created and saved successfully!', 
          'success'
        );
        
        // Navigate to templates page after successful save
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

        // Add to mock documents
        mockDocuments.push(newDocument);

        showNotification('Document created and saved successfully!', 'success');
        
        // Navigate to documents page after successful save
        setTimeout(() => {
          navigate('/templates');
        }, 1500);
      }

      // Navigate to documents page after successful save
      setTimeout(() => {
        navigate('/documents');
      }, 1500);
      
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

  const toggleLock = () => {
    setIsLocked(!isLocked);
    showNotification(
      isLocked ? 'Form unlocked - you can now make changes' : 'Form locked - changes are disabled',
      'success'
    );
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

  const getModeInfo = () => {
    if (isEditDocument) {
      return {
        title: 'Editing Document',
        subtitle: 'Modify document content',
        color: 'bg-orange-100 text-orange-800',
        icon: FileText
      };
    } else if (isCreateDocument) {
      return {
        title: 'Creating Document',
        subtitle: 'Fill data using template structure',
        color: 'bg-green-100 text-green-800',
        icon: FileText
      };
    } else if (isEditTemplate) {
      return {
        title: 'Editing Template',
        subtitle: 'Modify template structure',
        color: 'bg-blue-100 text-blue-800',
        icon: Settings
      };
    } else if (isNewTemplate) {
      return {
        title: 'New Template',
        subtitle: 'Create reusable template',
        color: 'bg-purple-100 text-purple-800',
        icon: Plus
      };
    } else {
      return {
        title: 'Form Builder',
        subtitle: 'Build your form',
        color: 'bg-gray-100 text-gray-800',
        icon: FileText
      };
    }
  };

  const modeInfo = getModeInfo();

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
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
                onChange={(e) => !isLocked && setFormName(e.target.value)}
                className={`text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 ${
                  modeInfo.color.includes('green') ? 'text-green-700' : 
                  modeInfo.color.includes('blue') ? 'text-blue-700' : 'text-purple-700'
                } ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
                placeholder="Enter name..."
                disabled={isLocked}
              />
              
              <select
                value={documentType}
                onChange={(e) => !isLocked && setDocumentType(e.target.value)}
                className={`px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 ${
                  isEditTemplate || isLocked ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                disabled={isEditTemplate || isLocked}
              >
                <option value="test_method">Test Method</option>
                <option value="sop">SOP</option>
                <option value="coa">Certificate of Analysis</option>
                <option value="specification">Specification</option>
                <option value="protocol">Protocol</option>
                <option value="report">Report</option>
              </select>
              
              {uploadedDocument && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm">
                  <Upload className="w-4 h-4" />
                  <span>{uploadedDocument}</span>
                </div>
              )}

              {isLocked && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm">
                  <Lock className="w-4 h-4" />
                  <span>Locked</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Zoom Controls */}
              <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-md">
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                  className="px-2 py-1 text-xs hover:bg-gray-200 rounded"
                >
                  -
                </button>
                <span className="text-xs font-medium w-12 text-center">{zoom}%</span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 10))}
                  className="px-2 py-1 text-xs hover:bg-gray-200 rounded"
                >
                  +
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-0.5">
                <button
                  onClick={() => setViewMode('canvas')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'canvas' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Canvas View"
                >
                  <Layers className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Undo/Redo */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0 || isLocked}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Undo"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1 || isLocked}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Redo"
                >
                  <RotateCcw className="w-4 h-4 scale-x-[-1]" />
                </button>
              </div>

              {/* Lock/Unlock */}
              <button
                onClick={toggleLock}
                className={`p-2 rounded-lg transition-colors ${
                  isLocked 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title={isLocked ? 'Unlock Form' : 'Lock Form'}
              >
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>

              {/* Clear Form */}
              <button
                onClick={clearForm}
                disabled={isLocked}
                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Clear All Fields"
              >
                <Trash2 className="w-4 h-4" />
              </button>

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
                    : isEditDocument
                      ? 'Save Document'
                      : isCreateDocument
                      ? 'Save Document' 
                      : isEditTemplate
                        ? 'Save Template' 
                        : 'Save Template'
                  }
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex pt-16 overflow-hidden">
          {/* Field Palette */}
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
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
                      disabled={isLocked}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {sections.map((section) => (
                      <div
                        key={section.id}
                        className="group p-2 bg-gray-50 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={section.name}
                            onChange={(e) => updateSection(section.id, { name: e.target.value })}
                            className="bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 flex-1"
                            disabled={isLocked}
                          />
                          {section.id !== 'default' && (
                            <button
                              onClick={() => handleDeleteSection(section.id)}
                              disabled={isLocked}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {fields.filter(f => f.section === section.id).length} fields
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Field List */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Fields ({fields.length})</h3>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {fields.map((field) => (
                      <div
                        key={field.id}
                        className={`group p-2 rounded-md text-xs cursor-pointer transition-colors ${
                          selectedField?.id === field.id 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => handleFieldSelect(field)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate flex-1">{field.label}</span>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateField(field.id);
                              }}
                              disabled={isLocked}
                              className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Duplicate"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteField(field.id);
                              }}
                              disabled={isLocked}
                              className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="text-gray-500 mt-1">
                          {field.type} • {field.required ? 'Required' : 'Optional'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Canvas */}
          <div 
            className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
              isPanelDocked && isPanelOpen ? 'mr-80' : ''
            }`}
          >
            <div className="flex-1 overflow-auto p-4" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
              <FormCanvas
                fields={fields}
                sections={sections}
                selectedField={selectedField}
                uploadedDocument={uploadedDocument}
                onSelectField={handleFieldSelect}
                onPropertiesClick={handlePropertiesClick}
                onUpdateField={updateField}
                onDeleteField={handleDeleteField}
                onMoveField={moveField}
                onAddField={addField}
              />
            </div>
          </div>

          {/* Properties Panel */}
          {selectedField && (
            <>
              {!isPanelDocked && isPanelOpen && (
                <div 
                  className="fixed inset-0 bg-black bg-opacity-25 z-40"
                  onClick={() => setIsPanelOpen(false)}
                />
              )}
              
              <div 
                className={`${
                  isPanelDocked 
                    ? 'fixed right-0 top-20 bottom-0 w-80 bg-white border-l border-gray-200 z-30' 
                    : 'fixed right-0 top-0 bottom-0 w-80 bg-white shadow-xl z-50'
                } transform transition-transform duration-300 ease-in-out ${
                  isPanelOpen ? 'translate-x-0' : 'translate-x-full'
                } flex flex-col h-full`}
              >
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

                <div className="flex-1 overflow-y-auto p-4">
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

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && itemToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Delete {itemToDelete.type === 'field' ? 'Field' : 'Section'}
                    </h3>
                    <p className="text-sm text-gray-600">This action cannot be undone.</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete "{itemToDelete.name}"?
                  {itemToDelete.type === 'section' && (
                    <span className="block text-sm text-gray-600 mt-1">
                      All fields in this section will be moved to the default section.
                    </span>
                  )}
                </p>
                
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      setDeleteModalOpen(false);
                      setItemToDelete(null);
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete {itemToDelete.type === 'field' ? 'Field' : 'Section'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default FormBuilder;